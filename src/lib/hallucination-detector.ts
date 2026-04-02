/**
 * Hallucination Detector
 * AI'ın uydurduğu kanun maddelerini ve bilgileri tespit eder
 */

import { validateCitations, type CitationValidation } from "./citation-validator";

export interface HallucinationReport {
  hasIssues: boolean;
  invalidCitations: CitationValidation[];
  warnings: string[];
  overallRisk: "low" | "medium" | "high";
  disclaimer: string;
}

/**
 * AI yanıtını hallucination açısından kontrol et
 */
export function detectHallucination(aiResponse: string): HallucinationReport {
  const warnings: string[] = [];
  const citations = validateCitations(aiResponse);
  const invalidCitations = citations.filter((c) => !c.valid);

  // 1. Geçersiz kanun maddesi atıfları
  if (invalidCitations.length > 0) {
    warnings.push(
      `${invalidCitations.length} atıf doğrulanamadı: ${invalidCitations.map((c) => c.original).join(", ")}`
    );
  }

  // 2. Şüpheli kalıplar
  const suspiciousPatterns = [
    { pattern: /\b(\d{4})\s*sayılı\s+([A-ZÇĞİÖŞÜa-zçğıöşü\s]+)\s+Kanunu/g, check: "kanun_no" },
    { pattern: /Yargıtay\s+\d+\.\s*(Hukuk|Ceza)\s*Dairesi.*?(\d{4}\/\d+)/g, check: "yargitay" },
  ];

  for (const { pattern } of suspiciousPatterns) {
    const matches = aiResponse.match(pattern);
    if (matches) {
      // Bilinen kanun numaralarıyla karşılaştır
      for (const match of matches) {
        const numMatch = match.match(/(\d{4})\s*sayılı/);
        if (numMatch) {
          const num = numMatch[1];
          const knownNums = ["4857", "6098", "4721", "6102", "5237", "5271", "6100", "2004", "6502", "2577", "6325", "6698", "1136", "7201", "492", "5326", "2709"];
          if (!knownNums.includes(num)) {
            warnings.push(`"${num} sayılı kanun" referansı bilinmeyen bir kanun numarası olabilir`);
          }
        }
      }
    }
  }

  // 3. Kesinlik ifadeleri kontrolü (AI çok kesin konuşuyorsa dikkat)
  const overConfidentPhrases = [
    /kesinlikle kazanırsınız/gi,
    /yüzde yüz/gi,
    /%100/g,
    /hiçbir şekilde kaybetmezsiniz/gi,
    /garantili/gi,
  ];

  for (const phrase of overConfidentPhrases) {
    if (phrase.test(aiResponse)) {
      warnings.push("AI aşırı kesin ifadeler kullanmış - hukuki sonuçlar garanti edilemez");
    }
  }

  // Risk seviyesi
  let overallRisk: HallucinationReport["overallRisk"] = "low";
  if (invalidCitations.length >= 3 || warnings.length >= 3) overallRisk = "high";
  else if (invalidCitations.length >= 1 || warnings.length >= 1) overallRisk = "medium";

  // Disclaimer
  const disclaimer = overallRisk === "high"
    ? "⚠️ Bu yanıtta doğrulanamayan bilgiler tespit edildi. Lütfen bir avukata danışın."
    : overallRisk === "medium"
    ? "ℹ️ Bazı atıflar doğrulanamadı. Kritik kararlar için avukat tavsiyesi alın."
    : "";

  return {
    hasIssues: warnings.length > 0 || invalidCitations.length > 0,
    invalidCitations,
    warnings,
    overallRisk,
    disclaimer,
  };
}

/**
 * AI yanıtına disclaimer ekle (gerekirse)
 */
export function appendDisclaimer(response: string, report: HallucinationReport): string {
  if (!report.disclaimer) return response;
  return `${response}\n\n${report.disclaimer}`;
}
