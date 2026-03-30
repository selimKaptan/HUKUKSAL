import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { text, category } = await request.json();

    if (!text || text.length < 10) {
      return NextResponse.json({ error: "Metin çok kısa" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI servisi yapılandırılmamış" }, { status: 503 });
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: `Sen bir hukuki metin düzenleme asistanısın. Kullanıcının anlattığı olayı, hukuki analiz için daha uygun ve profesyonel bir formata dönüştür.

KURALLAR:
- Kullanıcının anlattığı olayın özünü ve tüm detayları koru
- Kronolojik sıraya sok
- Hukuki terimler ekle (varsa)
- Tarihleri, kişileri ve olayları net belirt
- Eksik bilgi varsa "[tarih belirtilmemiş]" gibi yer tutucu koy
- Anlatımı profesyonel ama anlaşılır yap
- Orijinal metnin anlamını DEĞİŞTİRME
- Yeni bilgi EKLEME, sadece mevcut bilgiyi düzenle
- Türkçe yaz`,
      messages: [
        {
          role: "user",
          content: `Kategori: ${category || "Belirtilmemiş"}\n\nOrijinal metin:\n${text}\n\nBu metni hukuki analiz için uygun formata dönüştür. Sadece düzenlenmiş metni ver, başka açıklama ekleme.`,
        },
      ],
    });

    let improvedText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        improvedText += block.text;
      }
    }

    return NextResponse.json({ improvedText: improvedText.trim() });
  } catch (error) {
    console.error("Text improvement error:", error);
    return NextResponse.json({ error: "Metin iyileştirilemedi" }, { status: 500 });
  }
}
