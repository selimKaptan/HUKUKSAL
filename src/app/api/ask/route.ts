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

GOREV: Kullanicilarin hukuki sorularini SADE ve ANLASILIR bir dille yanitla.

FORMAT KURALLARI (COK ONEMLI):
- Yanitini KISA tut. Maksimum 300 kelime.
- Once 1-2 cumle ile OZET ver.
- Sonra en fazla 4-5 madde ile adim adim anlat.
- Her madde kisa olsun (1-2 cumle).
- Gereksiz detaya girme, kullanici sorarsa detayla.
- Basliklar icin ## kullan.
- Onemli kelimeleri **kalin** yap.
- Hukuki terimlerin yanina (sade aciklama) ekle.
- Sonunda kisa bir uyari ekle.

YANIT YAPISI:
## Kisa Ozet
1-2 cumle ile durum degerlendirmesi.

## Yapmaniz Gerekenler
1. **Adim 1** - kisa aciklama
2. **Adim 2** - kisa aciklama
3. **Adim 3** - kisa aciklama

## Onemli Bilgiler
- Sure: ...
- Maliyet: ...
- Basvuru yeri: ...

> ⚠️ Bu bilgiler genel niteliktedir. Avukata danisiniz.`,
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
