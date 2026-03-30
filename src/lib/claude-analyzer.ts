import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, CaseCategory, Precedent } from "@/types/database";
import { CASE_CATEGORY_LABELS } from "@/types/database";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sen JusticeGuard AI'sın — Türk hukuk sistemi konusunda uzman bir hukuki analiz asistanısın.

GÖREV: Kullanıcının anlattığı olayı analiz et, GERÇEK emsal Yargıtay/Danıştay kararlarını bul ve detaylı bir hukuki analiz raporu oluştur.

KURALLAR:
1. Türk hukuku çerçevesinde analiz yap.
2. Kazanma olasılığını %15-%92 arasında hesapla.
3. Güçlü ve zayıf yanları somut gerekçelerle belirt.
4. GERÇEK Yargıtay, Danıştay veya Bölge Adliye Mahkemesi kararlarını referans göster. Bildiğin gerçek karar numaralarını, daire bilgilerini ve tarihleri yaz. Uydurma karar numarası VERME. Eğer tam numarayı bilmiyorsan, ilgili dairenin yerleşik içtihatlarını açıkla.
5. Her emsal karar için: mahkeme adı, esas/karar numarası (biliyorsan), tarih, kısa özet, sonuç (davacı/davalı lehine) ve davanın kaç günde sonuçlandığı (tahmini) bilgilerini ver.
6. "Dava aç", "Açma" veya "Avukata danış" şeklinde net tavsiye ver.
7. Kesinlikle avukatlık hizmeti vermediğini belirt.

ÇIKTI FORMATI (JSON):
{
  "winProbability": number (15-92),
  "strengths": string[] (en az 2, en fazla 6 madde - somut gerekçeli),
  "weaknesses": string[] (en az 1, en fazla 5 madde - somut gerekçeli),
  "recommendation": "file_case" | "do_not_file" | "needs_review",
  "analysisReport": string (detaylı markdown rapor - en az 500 kelime),
  "riskFactors": string[] (risk faktörleri),
  "suggestedActions": string[] (önerilen adımlar, en az 3),
  "precedents": [
    {
      "court": string (örn: "Yargıtay 9. Hukuk Dairesi"),
      "case_number": string (örn: "2021/1234 E., 2022/5678 K." veya "Yerleşik İçtihat"),
      "date": string (örn: "2022-03-15" veya tahmini yıl),
      "summary": string (kararın özeti - en az 2 cümle),
      "ruling": string (mahkemenin kararı),
      "outcome": "plaintiff_won" | "defendant_won" | "settled" | "dismissed",
      "duration_days": number (davanın tahmini süresi gün cinsinden),
      "relevance_score": number (0-1 arası benzerlik skoru),
      "keywords": string[] (anahtar kelimeler)
    }
  ] (en az 3, en fazla 5 emsal karar)
}`;

export async function analyzeCaseWithClaude(
  eventSummary: string,
  category: CaseCategory,
  additionalNotes?: string
): Promise<AnalysisResult & { matchedPrecedents: (Precedent & { relevance_score: number })[] }> {
  const categoryLabel = CASE_CATEGORY_LABELS[category];

  const userMessage = `## DAVA BİLGİLERİ

**Kategori:** ${categoryLabel}

**Olay Özeti:**
${eventSummary}

${additionalNotes ? `**Ek Notlar:**\n${additionalNotes}\n` : ""}

---

Yukarıdaki olay özetini analiz et:
1. Bu davaya benzer GERÇEK Yargıtay/Danıştay emsal kararlarını bul (bildiğin gerçek kararlar)
2. Kazanma olasılığını hesapla
3. Güçlü ve zayıf yanları belirle
4. Detaylı hukuki analiz raporu yaz

Yanıtını SADECE geçerli JSON olarak ver, başka metin ekleme.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  // Extract text from response
  let jsonText = "";
  for (const block of response.content) {
    if (block.type === "text") {
      jsonText += block.text;
    }
  }

  // Clean up JSON
  jsonText = jsonText.trim();
  if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
  else if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
  if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
  jsonText = jsonText.trim();

  const analysis = JSON.parse(jsonText);

  // Claude'dan gelen emsal kararları Precedent formatına dönüştür
  const matchedPrecedents: (Precedent & { relevance_score: number })[] = (analysis.precedents || []).map(
    (p: Record<string, unknown>, i: number) => ({
      id: `claude_${i}`,
      created_at: new Date().toISOString(),
      court: (p.court as string) || "Yargıtay",
      case_number: (p.case_number as string) || "Yerleşik İçtihat",
      date: (p.date as string) || "",
      category,
      summary: (p.summary as string) || "",
      ruling: (p.ruling as string) || "",
      keywords: (p.keywords as string[]) || [],
      outcome: (p.outcome as string) || "plaintiff_won",
      duration_days: (p.duration_days as number) || undefined,
      relevance_score: (p.relevance_score as number) || Math.max(0.5, 0.9 - i * 0.15),
    })
  );

  return {
    winProbability: Math.max(15, Math.min(92, analysis.winProbability)),
    strengths: analysis.strengths || [],
    weaknesses: analysis.weaknesses || [],
    recommendation: analysis.recommendation || "needs_review",
    analysisReport: analysis.analysisReport || "",
    matchedPrecedents,
    riskFactors: analysis.riskFactors || [],
    suggestedActions: analysis.suggestedActions || [],
  };
}
