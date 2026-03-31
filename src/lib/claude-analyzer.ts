import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, CaseCategory, Precedent } from "@/types/database";
import { CASE_CATEGORY_LABELS } from "@/types/database";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sen JusticeGuard AI. Turk hukuku uzmanisin.

GOREV: Olayi analiz et, emsal karar bul, rapor olustur.

KURALLAR:
- Kazanma olasiligi %15-%92
- Guclu/zayif yanlari KISA yaz (her biri max 1 cumle)
- 7 emsal karar bul (gercek Yargitay kararlari, davaci lehine 4 + davali lehine 3 ideal)
- analysisReport KISA olsun (max 150 kelime)
- Her emsal karar KISA ozet (max 1 cumle summary, max 1 cumle ruling)
- JSON GECERLI olmali, string icinde tirnaksiz yaz

JSON FORMATI:
{
  "winProbability": number,
  "strengths": ["kisa madde 1", "kisa madde 2"],
  "weaknesses": ["kisa madde 1"],
  "recommendation": "file_case" | "do_not_file" | "needs_review",
  "analysisReport": "kisa rapor metni",
  "riskFactors": ["risk 1"],
  "suggestedActions": ["adim 1", "adim 2", "adim 3"],
  "precedents": [
    {
      "court": "Yargitay X. Hukuk Dairesi",
      "case_number": "2021/1234 E.",
      "date": "2022",
      "summary": "kisa ozet",
      "ruling": "karar",
      "outcome": "plaintiff_won",
      "duration_days": 400,
      "relevance_score": 0.8,
      "keywords": ["kelime1", "kelime2"]
    }
  ]
}

SADECE JSON ver. Baska metin EKLEME.`;

export async function analyzeCaseWithClaude(
  eventSummary: string,
  category: CaseCategory,
  additionalNotes?: string
): Promise<AnalysisResult & { matchedPrecedents: (Precedent & { relevance_score: number })[] }> {
  const categoryLabel = CASE_CATEGORY_LABELS[category];

  const userMessage = `Kategori: ${categoryLabel}
Olay: ${eventSummary}
${additionalNotes ? `Ek: ${additionalNotes}` : ""}

JSON olarak analiz et.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

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

  // JSON parse - kesik JSON'u düzeltmeye çalış
  let analysis;
  try {
    analysis = JSON.parse(jsonText);
  } catch {
    // JSON kesikse, kapanmamış string ve parantezleri kapat
    let fixed = jsonText;
    // Kapanmamış string'i kapat
    const quoteCount = (fixed.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) fixed += '"';
    // Kapanmamış array'leri kapat
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += "]";
    // Kapanmamış object'leri kapat
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    for (let i = 0; i < openBraces - closeBraces; i++) fixed += "}";

    try {
      analysis = JSON.parse(fixed);
    } catch {
      // Hala parse edilemiyorsa, temel yapıyı döndür
      throw new Error("Claude JSON parse hatasi: " + jsonText.substring(0, 200));
    }
  }

  const matchedPrecedents: (Precedent & { relevance_score: number })[] = (analysis.precedents || []).map(
    (p: Record<string, unknown>, i: number) => ({
      id: `claude_${i}`,
      created_at: new Date().toISOString(),
      court: (p.court as string) || "Yargitay",
      case_number: (p.case_number as string) || "Yerlesik Ictihat",
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
    winProbability: Math.max(15, Math.min(92, analysis.winProbability || 50)),
    strengths: analysis.strengths || ["Detayli analiz icin avukata danisin"],
    weaknesses: analysis.weaknesses || ["Ek bilgi gerekli"],
    recommendation: analysis.recommendation || "needs_review",
    analysisReport: analysis.analysisReport || "",
    matchedPrecedents,
    riskFactors: analysis.riskFactors || [],
    suggestedActions: analysis.suggestedActions || ["Avukata danisin"],
  };
}
