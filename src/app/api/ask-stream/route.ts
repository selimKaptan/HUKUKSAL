import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyCsrf } from "@/lib/api-security";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
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

MEVZUAT ATIF SİSTEMİ (ÇOK ÖNEMLİ):
- Her hukuki tavsiyende MUTLAKA ilgili kanun maddesini belirt
- Format: "İK md. 17", "TBK md. 347", "TMK md. 174" şeklinde kısa atıf kullan
- Temel kanunlar: İK (İş Kanunu 4857), TBK (Borçlar 6098), TMK (Medeni 4721), TTK (Ticaret 6102), TCK (Ceza 5237), HMK (Muhakemeler 6100), İİK (İcra İflas 2004), TKHK (Tüketici 6502), İYUK (İdari Yargılama 2577), HUAK (Arabuluculuk 6325)
- Zamanaşımı sürelerini belirtirken kanun maddesini de yaz
- Gerektiğinde AİHS (Avrupa İnsan Hakları Sözleşmesi) maddelerine de atıf yap
- Anayasa maddelerine atıf: "Anayasa md. 36 (hak arama hürriyeti)" gibi

DİLEKÇE YÖNLENDİRMESİ:
- Kullanıcıya yeterli bilgi verdikten sonra (3-4 mesaj sonra), MUTLAKA şunu söyle:
  "Bu tarz işlemler için avukat tutmanıza gerek yok! Yapmanız gerekenleri adım adım yazıyorum. Sağ üstteki 📄 butonundan hazır dilekçe şablonlarınıza ulaşabilirsiniz."
- Süre sınırı varsa MUTLAKA vurgula (örn: "İK md. 20 gereğince 1 ay içinde arabulucuya başvurmalısınız!")
- Emsal karar araması gerekiyorsa: "Detaylı emsal analizi için + butonundan AI Emsal'ı kullanabilirsiniz" de

SORUMLULUK REDDİ:
- Verdiğin bilgiler genel hukuki bilgilendirmedir, avukatlık hizmeti yerine geçmez
- Karmaşık davalarda mutlaka bir avukata danışılmasını öner`;

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

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: LAWYER_SYSTEM_PROMPT,
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
