import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, CaseCategory, Precedent } from "@/types/database";
import { CASE_CATEGORY_LABELS } from "@/types/database";
import { PRECEDENTS_DB } from "./precedents-data";
import type { UyapDecision } from "./uyap-client";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sen JusticeGuard AI'sın — Türk hukuk sistemi konusunda uzman bir hukuki analiz asistanısın.

GÖREV: Kullanıcının anlattığı olayı analiz et, emsal kararlarla karşılaştır ve detaylı bir hukuki analiz raporu oluştur.

KURALLAR:
1. Türk hukuku çerçevesinde analiz yap.
2. Kazanma olasılığını %15-%92 arasında hesapla (hiçbir zaman %100 veya %0 verme).
3. Güçlü ve zayıf yanları somut gerekçelerle belirt.
4. Emsal kararları referans göstererek karşılaştırmalı analiz yap.
5. "Dava aç", "Açma" veya "Avukata danış" şeklinde net tavsiye ver.
6. Profesyonel ama anlaşılır bir dil kullan.
7. Kesinlikle avukatlık hizmeti vermediğini belirt.
8. Verilen emsal kararlardan en alakalı olanları seç ve relevance_score (0.0-1.0) ver.

ÇIKTI FORMATI (JSON):
{
  "winProbability": number (15-92),
  "strengths": string[] (en az 2, en fazla 6 madde),
  "weaknesses": string[] (en az 1, en fazla 5 madde),
  "recommendation": "file_case" | "do_not_file" | "needs_review",
  "analysisReport": string (detaylı markdown rapor),
  "riskFactors": string[] (risk faktörleri),
  "suggestedActions": string[] (önerilen adımlar, en az 3),
  "selectedPrecedentIndices": number[] (en alakalı emsal kararların indeks numaraları, 0'dan başlar, en fazla 5),
  "precedentScores": number[] (seçilen her emsal için 0.0-1.0 arası benzerlik skoru)
}`;

interface IndexedPrecedent {
  index: number;
  source: "local" | "uyap";
  localPrecedent?: (typeof PRECEDENTS_DB)[number];
  uyapDecision?: UyapDecision;
}

function buildPrecedentContext(
  category: CaseCategory,
  uyapDecisions?: UyapDecision[]
): { context: string; indexedPrecedents: IndexedPrecedent[] } {
  const indexedPrecedents: IndexedPrecedent[] = [];
  let globalIndex = 0;

  // Yerel emsal kararlar
  const localPrecedents = PRECEDENTS_DB.filter(
    (p) => p.category === category
  ).slice(0, 5);

  let context = "## EMSAL KARAR VERİTABANI\nAşağıdaki kararları analiz et ve olaya en uygun olanları seç. selectedPrecedentIndices ile indeks numaralarını, precedentScores ile benzerlik skorlarını belirt.\n\n";

  localPrecedents.forEach((p) => {
    context += `### [İndeks ${globalIndex}] ${p.court} - ${p.case_number}\n`;
    context += `Kaynak: Yerel DB\n`;
    context += `Tarih: ${p.date}\n`;
    context += `Özet: ${p.summary}\n`;
    context += `Karar: ${p.ruling}\n`;
    context += `Sonuç: ${p.outcome === "plaintiff_won" ? "Davacı Kazandı" : p.outcome === "defendant_won" ? "Davalı Kazandı" : "Uzlaşma/Red"}\n`;
    context += `Anahtar Kelimeler: ${p.keywords.join(", ")}\n\n`;
    indexedPrecedents.push({
      index: globalIndex,
      source: "local",
      localPrecedent: p,
    });
    globalIndex++;
  });

  // UYAP emsal kararlar
  if (uyapDecisions && uyapDecisions.length > 0) {
    context += "\n## UYAP EMSAL KARARLARI (emsal.uyap.gov.tr - Resmi Kaynak)\n\n";
    uyapDecisions.forEach((d) => {
      context += `### [İndeks ${globalIndex}] ${d.mahkeme}\n`;
      context += `Kaynak: UYAP Resmi\n`;
      context += `Esas No: ${d.esas_no}\n`;
      context += `Karar No: ${d.karar_no}\n`;
      context += `Tarih: ${d.karar_tarihi}\n`;
      if (d.ozet) context += `Özet: ${d.ozet}\n`;
      if (d.metin) context += `Metin (kısaltılmış): ${d.metin.substring(0, 500)}\n`;
      context += "\n";
      indexedPrecedents.push({
        index: globalIndex,
        source: "uyap",
        uyapDecision: d,
      });
      globalIndex++;
    });
  }

  return { context, indexedPrecedents };
}

export async function analyzeCaseWithClaude(
  eventSummary: string,
  category: CaseCategory,
  additionalNotes?: string,
  uyapDecisions?: UyapDecision[]
): Promise<AnalysisResult & { matchedPrecedents: (Precedent & { relevance_score: number })[] }> {
  const { context: precedentContext, indexedPrecedents } = buildPrecedentContext(category, uyapDecisions);
  const categoryLabel = CASE_CATEGORY_LABELS[category];

  const userMessage = `## DAVA BİLGİLERİ

**Kategori:** ${categoryLabel}
**Olay Özeti:**
${eventSummary}

${additionalNotes ? `**Ek Notlar:**\n${additionalNotes}\n` : ""}

${precedentContext}

---

Yukarıdaki olay özetini ve emsal kararları analiz ederek JSON formatında hukuki analiz raporu oluştur.
Emsal kararlardan bu davaya EN UYGUN olanları seç. selectedPrecedentIndices alanına seçtiğin kararların [İndeks X] numaralarını, precedentScores alanına da her biri için 0.0-1.0 arası benzerlik skorunu yaz.
Yanıtını SADECE geçerli JSON olarak ver, başka metin ekleme.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
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

  // Clean up JSON - remove markdown code fences if present
  jsonText = jsonText.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  const analysis = JSON.parse(jsonText);

  // AI'ın seçtiği emsal kararları kullan
  const selectedIndices: number[] = analysis.selectedPrecedentIndices || [];
  const precedentScores: number[] = analysis.precedentScores || [];

  const matchedPrecedents: (Precedent & { relevance_score: number })[] = [];

  if (selectedIndices.length > 0) {
    // AI'ın seçtiği emsalleri kullan
    selectedIndices.forEach((idx: number, i: number) => {
      const indexed = indexedPrecedents.find((p) => p.index === idx);
      if (!indexed) return;

      const score = precedentScores[i] ?? 0.5;

      if (indexed.source === "local" && indexed.localPrecedent) {
        const p = indexed.localPrecedent;
        matchedPrecedents.push({
          ...p,
          id: `local_${idx}`,
          created_at: new Date().toISOString(),
          relevance_score: Math.max(0.1, Math.min(1, score)),
        });
      } else if (indexed.source === "uyap" && indexed.uyapDecision) {
        const d = indexed.uyapDecision;
        matchedPrecedents.push({
          id: `uyap_${idx}`,
          case_number: d.esas_no || d.karar_no || `UYAP-${idx}`,
          court: d.mahkeme || "Belirtilmemiş",
          date: d.karar_tarihi || "",
          summary: d.ozet || d.metin?.substring(0, 300) || "",
          ruling: d.karar_no ? `Karar No: ${d.karar_no}` : "Karar bilgisi mevcut",
          outcome: "plaintiff_won" as const,
          category,
          keywords: [],
          created_at: new Date().toISOString(),
          relevance_score: Math.max(0.1, Math.min(1, score)),
        });
      }
    });
  }

  // AI hiç emsal seçemediyse, fallback olarak yerel DB'den al
  if (matchedPrecedents.length === 0) {
    const localPrecedents = PRECEDENTS_DB.filter(
      (p) => p.category === category
    ).slice(0, 3);
    localPrecedents.forEach((p, i) => {
      matchedPrecedents.push({
        ...p,
        id: `local_${i}`,
        created_at: new Date().toISOString(),
        relevance_score: Math.max(0.3, 0.8 - i * 0.15),
      });
    });
  }

  // Skora göre sırala
  matchedPrecedents.sort((a, b) => b.relevance_score - a.relevance_score);

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
