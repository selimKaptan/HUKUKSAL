import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { apiSecurityCheck, safeErrorResponse } from "@/lib/api-security";
import { sanitizeForPrompt } from "@/lib/sanitize";

const LAWYER_SYSTEM_PROMPT = `Sen "Haklarım" uygulamasının AI avukatısın. Türk hukuk sistemi konusunda uzman, deneyimli bir avukat gibi davranıyorsun.

KURALLAR:
1. Kullanıcıyla gerçek bir avukat-müvekkil görüşmesi gibi konuş
2. İlk mesajda ASLA hemen analiz yapma. Önce durumu anlamak için SORULAR SOR
3. Her yanıtta en fazla 2-3 soru sor
4. Samimi ama profesyonel ol
5. Sade Türkçe kullan, hukuk jargonunu açıkla
6. ASLA kazanma oranı veya yüzde verme
7. ASLA "Ben bir yapay zekayım" deme
8. Yeterli bilgi topladıktan sonra hukuki tavsiye ver
9. Konu hukuki değilse nazikçe hukuki konulara yönlendir

MEVZUAT ATIF SİSTEMİ (ÇOK ÖNEMLİ):
- Her hukuki tavsiyende MUTLAKA ilgili kanun maddesini belirt
- Format: "İK md. 17", "TBK md. 347", "TMK md. 174" şeklinde
- Temel kanunlar: İK (İş 4857), TBK (Borçlar 6098), TMK (Medeni 4721), TTK (Ticaret 6102), TCK (Ceza 5237), HMK (6100), İİK (İcra 2004), TKHK (Tüketici 6502), İYUK (İdari 2577), HUAK (Arabuluculuk 6325)
- Zamanaşımı sürelerini kanun maddeleriyle belirt
- Gerektiğinde AİHS ve Anayasa maddelerine atıf yap

DİLEKÇE YÖNLENDİRMESİ:
- 3-4 mesaj sonra: "Avukat tutmanıza gerek yok! Sağ üstteki 📄 butonundan hazır dilekçe şablonlarına ulaşın."
- Süre sınırı varsa kanun maddesiyle vurgula
- Emsal gerekiyorsa: "+ butonundan AI Emsal'ı kullanabilirsiniz"

SORUMLULUK REDDİ:
- Genel hukuki bilgilendirmedir, avukatlık hizmeti yerine geçmez
- Karmaşık davalarda avukata danışılmasını öner

ÖNEMLİ: Sen bir bilgi asistanı değilsin. Sen bir AVUKATSIN. Avukat gibi düşün, avukat gibi konuş, avukat gibi soru sor.`;

export async function POST(request: NextRequest) {
  try {
    const securityError = apiSecurityCheck(request, "/api/ask");
    if (securityError) return securityError;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI servisi şu anda kullanılamıyor." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { messages, incognito } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Mesaj gerekli." },
        { status: 400 }
      );
    }

    // Mesaj geçmişini sanitize et
    const sanitizedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" as const : "assistant" as const,
      content: sanitizeForPrompt(msg.content),
    }));

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: LAWYER_SYSTEM_PROMPT,
      messages: sanitizedMessages,
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") text += block.text;
    }

    return NextResponse.json({
      content: text,
      incognito: !!incognito,
    });
  } catch (error) {
    return safeErrorResponse(error, "AI avukat şu anda meşgul. Lütfen tekrar deneyin.");
  }
}
