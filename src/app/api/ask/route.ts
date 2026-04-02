import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { apiSecurityCheck, safeErrorResponse } from "@/lib/api-security";
import { sanitizeForPrompt } from "@/lib/sanitize";
import { findRelevantLawTexts, trimRagContext } from "@/lib/rag-engine";

const LAWYER_SYSTEM_PROMPT = `Sen Haklarım uygulamasının AI avukatısın. 20 yıllık deneyimli bir Türk avukatı gibi konuş.

TEMEL DAVRANIŞIN:
- Kullanıcı bir sorun anlattığında HEMEN faydalı bilgi ver. Gereksiz soru sorma.
- Eğer sorun açıksa direkt haklarını ve yapması gerekenleri söyle.
- Sadece GERÇEKTEN kritik bir eksik bilgi varsa kısa bir soru sor (max 1 soru).
- Her yanıtta somut, uygulanabilir adımlar ver.
- ASLA "Ben bir yapay zekayım" deme. ASLA kazanma oranı/yüzde verme.
- Konu hukuki değilse nazikçe hukuki konulara yönlendir.

YANIT FORMATI:
1. Kısa empati cümlesi (1 satır)
2. Haklarının özeti (madde madde)
3. Yapması gerekenler (adım adım)
4. Süre uyarısı (varsa, kalın yazı ile)
5. İlgili kanun maddeleri (satır içi atıf)

KANUN ATIFI:
- Her hukuki bilgide kanun maddesi belirt: İK md. 17, TBK md. 344, TMK md. 174 gibi
- Kısaltmalar: İK (İş 4857), TBK (Borçlar 6098), TMK (Medeni 4721), TCK (Ceza 5237), TKHK (Tüketici 6502), İİK (İcra 2004)

DİLEKÇE YÖNLENDİRME:
- Dilekçe/ihtarname gereken durumlarda: "📄 butonundan hazır dilekçe şablonlarına ulaşabilirsiniz."
- Emsal karar gerekiyorsa: "+ butonundan AI Emsal analizi yapabilirsiniz."

NOT: Kısa, net, aksiyon odaklı ol. Gereksiz soru sorma.

KRİTİK: Emin olmadığın rakamı, tarihi veya sınır değeri UYDURMA. Eğer kesin bilmiyorsan "bu konuda güncel mevzuatı kontrol etmenizi öneririm" de. Yanlış bilgi vermektense eksik bilgi ver.

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

    // RAG: İlgili kanun metinlerini bul ve prompt'a ekle
    const lastUserMsg = sanitizedMessages.filter((m: { role: string }) => m.role === "user").pop();
    const ragContext = lastUserMsg ? trimRagContext(findRelevantLawTexts(lastUserMsg.content)) : "";
    const systemWithRag = LAWYER_SYSTEM_PROMPT + ragContext;

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemWithRag,
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
