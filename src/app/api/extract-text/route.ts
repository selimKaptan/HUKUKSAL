import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { apiSecurityCheck, safeErrorResponse } from "@/lib/api-security";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// Dosya magic bytes doğrulaması
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

function validateMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;

  const bytes = new Uint8Array(buffer.slice(0, 8));
  return signatures.some((sig) =>
    sig.every((byte, i) => bytes[i] === byte)
  );
}

function getMediaType(
  mimeType: string
): "image/jpeg" | "image/png" | "image/webp" | "application/pdf" {
  const map: Record<string, "image/jpeg" | "image/png" | "image/webp" | "application/pdf"> = {
    "image/jpeg": "image/jpeg",
    "image/png": "image/png",
    "image/webp": "image/webp",
    "application/pdf": "application/pdf",
  };
  return map[mimeType] || "image/jpeg";
}

export async function POST(request: NextRequest) {
  try {
    // Güvenlik kontrolü (CSRF + Rate Limit)
    const securityError = apiSecurityCheck(request, "/api/extract-text");
    if (securityError) return securityError;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI belge analizi için API anahtarı gereklidir" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Lütfen bir dosya yükleyin" },
        { status: 400 }
      );
    }

    // MIME type kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya formatı. Lütfen JPG, PNG, WebP veya PDF yükleyin." },
        { status: 400 }
      );
    }

    // Dosya boyut kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB sınırını aşıyor" },
        { status: 400 }
      );
    }

    // Dosya adı sanitizasyonu (path traversal koruması)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 255);
    if (safeName !== file.name) {
      console.log(`[Security] Filename sanitized: ${file.name} -> ${safeName}`);
    }

    const bytes = await file.arrayBuffer();

    // Magic bytes doğrulaması - MIME type spoofing koruması
    if (!validateMagicBytes(bytes, file.type)) {
      return NextResponse.json(
        { error: "Dosya içeriği belirtilen format ile uyuşmuyor." },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = getMediaType(file.type);

    const client = new Anthropic({ apiKey });
    const isPdf = file.type === "application/pdf";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content: any[] = isPdf
      ? [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          },
          { type: "text", text: "Bu belgeyi analiz et ve aşağıdaki bilgileri çıkar." },
        ]
      : [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          { type: "text", text: "Bu belge görüntüsünü analiz et ve aşağıdaki bilgileri çıkar." },
        ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: `Sen bir Türk hukuk belgesi analiz uzmanısın. Yüklenen belge görüntülerinden metin çıkarma (OCR) ve hukuki analiz yapıyorsun.

Görevin:
1. Belgedeki TÜM metni eksiksiz olarak çıkar
2. Belge türünü belirle (sözleşme, dilekçe, mahkeme kararı, fatura, vekaletname, ihbarname, tutanak, bilirkişi raporu vb.)
3. Önemli hukuki noktaları özetle
4. Anahtar hukuki noktaları listele

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey ekleme:
{
  "extractedText": "belgeden çıkarılan tam metin",
  "documentType": "belge türü",
  "summary": "belgenin kısa hukuki özeti",
  "keyPoints": ["anahtar nokta 1", "anahtar nokta 2", ...]
}

Eğer belge okunamıyorsa veya metin bulunamıyorsa, extractedText alanını boş bırak ve summary'de durumu açıkla.`,
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "AI yanıtı işlenemedi" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      let jsonStr = textBlock.text.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      parsed = JSON.parse(jsonStr);
    } catch {
      // rawResponse artık client'a GÖNDERİLMİYOR - güvenlik düzeltmesi
      console.error("[AI Parse Error] JSON parse failed for extract-text response");
      return NextResponse.json(
        { error: "Belge analizi sonucu işlenemedi. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      extractedText: parsed.extractedText || "",
      documentType: parsed.documentType || "Bilinmeyen",
      summary: parsed.summary || "",
      keyPoints: parsed.keyPoints || [],
    });
  } catch (error) {
    // API hata detayları artık client'a GÖNDERİLMİYOR
    return safeErrorResponse(error, "Belge analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
  }
}
