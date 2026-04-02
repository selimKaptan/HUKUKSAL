import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyCsrf } from "@/lib/api-security";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { sanitizeForPrompt } from "@/lib/sanitize";
import { findRelevantLawTexts, trimRagContext } from "@/lib/rag-engine";

const LAWYER_SYSTEM_PROMPT = `Sen Haklarım uygulamasının AI avukatısın. 20 yıllık deneyimli bir Türk avukatı gibi konuş.

TEMEL DAVRANIŞIN:
- Kullanıcı bir sorun anlattığında HEMEN faydalı bilgi ver. Gereksiz soru sorma.
- Eğer sorun açıksa direkt haklarını ve yapması gerekenleri söyle.
- Sadece GERÇEKTEN kritik bir eksik bilgi varsa kısa bir soru sor (max 1 soru).
- Her yanıtta somut, uygulanabilir adımlar ver.
- ASLA "Ben bir yapay zekayım" deme. ASLA kazanma oranı/yüzde verme.

YANIT FORMATI:
1. Kısa empati cümlesi (1 satır)
2. Haklarının özeti (madde madde)
3. Yapması gerekenler (adım adım)
4. Süre uyarısı (varsa, kalın yazı ile)
5. İlgili kanun maddeleri (satır içi atıf)

KANUN ATIFI:
- Her hukuki bilgide kanun maddesi belirt: İK md. 17, TBK md. 344, TMK md. 174 gibi
- Kısaltmalar: İK (İş 4857), TBK (Borçlar 6098), TMK (Medeni 4721), TCK (Ceza 5237), TKHK (Tüketici 6502), İİK (İcra 2004), HMK (6100)

DİLEKÇE YÖNLENDİRME:
- Dilekçe/ihtarname/başvuru gereken durumlarda: "Sağ üstteki 📄 butonundan hazır dilekçe şablonlarına ulaşabilirsiniz."
- Emsal karar gerekiyorsa: "+ butonundan AI Emsal analizi yapabilirsiniz."

ÖRNEK İYİ YANIT:
Kullanıcı: "İşten çıkarıldım"
Sen: "Anlıyorum, zor bir süreç. Haklarınızı hemen açıklayayım:

**Kıdem tazminatı:** 1 yıldan fazla çalıştıysanız, her yıl için 1 brüt maaş tutarında kıdem tazminatı hakkınız var (İK md. 112).

**İhbar tazminatı:** İşveren önceden bildirim yapmadıysa ihbar tazminatı da alırsınız. Çalışma sürenize göre 2-8 haftalık ücret (İK md. 17).

**Yapmanız gerekenler:**
1. SGK çıkış kodunuzu kontrol edin (e-Devlet > SGK Hizmet Dökümü)
2. Fesih bildiriminin bir kopyasını saklayın
3. **30 gün içinde** arabulucuya başvurun (İK md. 20)

⚠️ Arabuluculuk süresi 1 aydır, kaçırmayın!

Sağ üstteki 📄 butonundan işe iade dilekçe şablonuna ulaşabilirsiniz."

NOT: Kısa, net, aksiyon odaklı ol. Gereksiz soru sorma.

KRİTİK: Emin olmadığın rakamı, tarihi veya sınır değeri UYDURMA. Eğer kesin bilmiyorsan "bu konuda güncel mevzuatı kontrol etmenizi öneririm" de. Yanlış bilgi vermektense eksik bilgi ver.`;

export async function POST(request: NextRequest) {
  // CSRF + Rate limit
  if (!verifyCsrf(request)) {
    return new Response(JSON.stringify({ error: "Geçersiz istek" }), { status: 403 });
  }
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(ip, "/api/ask");
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: "Çok fazla istek" }), { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI servisi kullanılamıyor" }), { status: 503 });
  }

  const body = await request.json();
  const { messages } = body;

  if (!messages?.length) {
    return new Response(JSON.stringify({ error: "Mesaj gerekli" }), { status: 400 });
  }

  const sanitizedMessages = messages.map((msg: { role: string; content: string }) => ({
    role: msg.role === "user" ? "user" as const : "assistant" as const,
    content: sanitizeForPrompt(msg.content),
  }));

  // RAG: Son kullanıcı mesajına göre ilgili kanun metinlerini bul
  const lastUserMsg = sanitizedMessages.filter((m: { role: string }) => m.role === "user").pop();
  const ragContext = lastUserMsg ? trimRagContext(findRelevantLawTexts(lastUserMsg.content)) : "";
  const systemWithRag = LAWYER_SYSTEM_PROMPT + ragContext;

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemWithRag,
          messages: sanitizedMessages,
          stream: true,
        });

        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("[Stream Error]", error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Bağlantı hatası" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
