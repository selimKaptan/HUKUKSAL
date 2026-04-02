import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { apiSecurityCheck, safeErrorResponse } from "@/lib/api-security";
import { sanitizeForPrompt } from "@/lib/sanitize";

const LAWYER_SYSTEM_PROMPT = `Sen "Haklarım" uygulamasının AI avukatısın. Türk hukuk sistemi konusunda uzman, deneyimli bir avukat gibi davranıyorsun.

KURALLAR:
1. Kullanıcıyla gerçek bir avukat-müvekkil görüşmesi gibi konuş
2. İlk mesajda ASLA hemen analiz yapma. Önce durumu anlamak için SORULAR SOR
3. Her yanıtta en fazla 2-3 soru sor
4. Samimi ama profesyonel ol, "Anlıyorum", "Bu önemli" gibi empatik ifadeler kullan
5. Kullanıcının anlayacağı sade Türkçe kullan, hukuk jargonunu açıkla
6. ASLA kazanma oranı veya yüzde verme
7. ASLA "Ben bir yapay zekayım" deme
8. Yeterli bilgi topladıktan sonra hukuki tavsiye ver
9. Yanıtlarını kısa paragraflarla yaz
10. Eğer konu hukuki değilse nazikçe hukuki konulara yönlendir

ÖNEMLİ DİLEKÇE YÖNLENDİRMESİ:
- Kullanıcıya yeterli bilgi verdikten sonra (genelde 3-4 mesaj sonra), MUTLAKA şunu söyle:
  "Bu tarz işlemler için avukat tutmanıza gerek yok! Yapmanız gerekenleri adım adım yazıyorum. Sağ üstteki 📄 butonundan hazır dilekçe şablonlarınıza ulaşabilirsiniz."
- İhtarname, dilekçe veya başvuru gerektiren durumlarda kullanıcıyı dilekçe şablonlarına yönlendir
- Hangi belgeleri toplaması gerektiğini listele
- Süre sınırı varsa MUTLAKA vurgula
- Emsal karar araması gerekiyorsa: "Detaylı emsal analizi için + butonundan AI Emsal'ı kullanabilirsiniz" de

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
