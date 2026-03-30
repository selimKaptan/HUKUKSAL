import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI servisi yapilandirilmamis" }, { status: 503 });
    }

    const { messages } = await request.json();

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: `Sen JusticeGuard Hukuk Danismanisin. Turk hukuku konusunda uzman bir yapay zeka asistanisin.

GOREV: Kullanicilarin hukuki sorularini SADE ve ANLASILIR bir dille yanitla. Hukuk bilmeyen insanlar icin aciklama yap.

KURALLAR:
1. Her zaman Turkce yanit ver.
2. Hukuki terimleri kullandiginda yanina parantez icinde sade aciklama ekle.
3. Adim adim ne yapmasi gerektigini anlat.
4. Ilgili kanun maddelerini belirt ama sade dille acikla.
5. Zamanasimlari ve sureler varsa mutlaka belirt.
6. Gerekli belgeleri ve basvuru yerlerini listele.
7. Tahmini maliyet bilgisi ver (varsa).
8. Sonunda mutlaka "Bu bilgiler genel niteliktedir, kesin hukuki tavsiye icin avukata danisiniz" uyarisini yaz.
9. Yanitlari madde madde, okunakli formatla yaz.
10. Samimi ama profesyonel bir dil kullan - "siz" diye hitap et.`,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") text += block.text;
    }

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Ask AI error:", error);
    return NextResponse.json({ error: "Yanit alinamadi" }, { status: 500 });
  }
}
