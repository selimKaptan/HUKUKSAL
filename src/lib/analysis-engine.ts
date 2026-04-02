import { PRECEDENTS_DB } from "./precedents-data";
import { estimateCaseDuration } from "./duration-estimator";
import type { AnalysisResult, CaseCategory, Precedent } from "@/types/database";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wçğıöşüÇĞİÖŞÜ\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function computeSimilarity(tokens1: string[], tokens2: string[]): number {
  const set2 = new Set(tokens2);
  let intersectionCount = 0;
  tokens1.forEach((t) => { if (set2.has(t)) intersectionCount++; });
  const unionSet = new Set(tokens1.concat(tokens2));
  if (unionSet.size === 0) return 0;
  return intersectionCount / unionSet.size;
}

function findMatchingPrecedents(
  eventSummary: string,
  category: CaseCategory,
  topN: number = 3
): (Omit<Precedent, "id" | "created_at"> & { relevance_score: number })[] {
  const inputTokens = tokenize(eventSummary);

  const scored = PRECEDENTS_DB.map((p) => {
    const precedentTokens = [
      ...tokenize(p.summary),
      ...tokenize(p.ruling),
      ...p.keywords.flatMap((k) => tokenize(k)),
    ];

    let score = computeSimilarity(inputTokens, precedentTokens);

    // Category bonus
    if (p.category === category) {
      score += 0.25;
    }

    // Keyword exact match bonus
    for (const keyword of p.keywords) {
      const kwTokens = tokenize(keyword);
      for (const kwToken of kwTokens) {
        if (inputTokens.includes(kwToken)) {
          score += 0.05;
        }
      }
    }

    return { ...p, relevance_score: Math.min(score, 1) };
  });

  scored.sort((a, b) => b.relevance_score - a.relevance_score);
  return scored.slice(0, topN);
}

function analyzeStrengths(
  eventSummary: string,
  category: CaseCategory,
  matchedPrecedents: (Omit<Precedent, "id" | "created_at"> & { relevance_score: number })[]
): string[] {
  const strengths: string[] = [];
  const text = eventSummary.toLowerCase();

  // Evidence-based strengths
  if (text.includes("belge") || text.includes("kanıt") || text.includes("ispat") || text.includes("delil")) {
    strengths.push("Belgesel kanıt mevcudiyeti davanızı güçlendirebilir.");
  }
  if (text.includes("tanık") || text.includes("şahit")) {
    strengths.push("Tanık beyanları davanızı destekleyebilir.");
  }
  if (text.includes("sözleşme") || text.includes("kontrat") || text.includes("anlaşma")) {
    strengths.push("Yazılı sözleşme/anlaşma varlığı hukuki zemin oluşturmaktadır.");
  }
  if (text.includes("ihtar") || text.includes("noter") || text.includes("ihtarname")) {
    strengths.push("Noterden çekilmiş ihtarname yasal sürecin başlatıldığını gösterir.");
  }

  // Category-specific strengths
  const categoryStrengths: Record<string, string[]> = {
    is_hukuku: [
      "İş hukuku genellikle işçi lehine yorumlanmaktadır.",
      "SGK kayıtları ve bordro dökümleri güçlü delil niteliğindedir.",
    ],
    aile_hukuku: [
      "Çocuğun üstün yararı ilkesi mahkeme kararlarında belirleyicidir.",
    ],
    tuketici_hukuku: [
      "Tüketici mevzuatı genellikle tüketici lehine düzenlenmiştir.",
      "Ayıplı mal/hizmet iddialarında ispat yükü satıcıdadır.",
    ],
    kira_hukuku: [
      "Kira sözleşmesi ve ödeme kayıtları güçlü delillerdir.",
    ],
    ceza_hukuku: [
      "Dijital deliller (ekran görüntüleri, mesajlar) hukuki geçerliliğe sahiptir.",
    ],
  };

  if (categoryStrengths[category]) {
    strengths.push(...categoryStrengths[category]);
  }

  // Precedent-based strengths
  const favorablePrecedents = matchedPrecedents.filter(
    (p) => p.outcome === "plaintiff_won" && p.relevance_score > 0.15
  );
  if (favorablePrecedents.length > 0) {
    strengths.push(
      `Benzer ${favorablePrecedents.length} emsal karar davacı lehine sonuçlanmıştır.`
    );
  }

  if (strengths.length === 0) {
    strengths.push("Detaylı hukuki değerlendirme için avukat görüşü önerilir.");
  }

  return strengths;
}

function analyzeWeaknesses(
  eventSummary: string,
  category: CaseCategory,
  matchedPrecedents: (Omit<Precedent, "id" | "created_at"> & { relevance_score: number })[]
): string[] {
  const weaknesses: string[] = [];
  const text = eventSummary.toLowerCase();
  const wordCount = text.split(/\s+/).length;

  if (wordCount < 30) {
    weaknesses.push("Olay açıklaması yetersiz detay içermektedir. Daha kapsamlı bilgi davanızı güçlendirir.");
  }

  if (!text.includes("belge") && !text.includes("kanıt") && !text.includes("delil") && !text.includes("ispat")) {
    weaknesses.push("Somut belgesel kanıt belirtilmemiştir. Delil yetersizliği risk oluşturabilir.");
  }

  if (!text.includes("tarih") && !text.includes("gün") && !text.includes("ay") && !text.includes("yıl")) {
    weaknesses.push("Kesin tarih bilgisi eksikliği zamanaşımı riski doğurabilir.");
  }

  const unfavorablePrecedents = matchedPrecedents.filter(
    (p) => p.outcome === "defendant_won" && p.relevance_score > 0.15
  );
  if (unfavorablePrecedents.length > 0) {
    weaknesses.push(
      `Benzer ${unfavorablePrecedents.length} emsal karar davalı lehine sonuçlanmıştır.`
    );
  }

  if (text.includes("sözlü") || text.includes("yazılı değil")) {
    weaknesses.push("Sözlü anlaşmalar ispat güçlüğü yaratabilir.");
  }

  if (weaknesses.length === 0) {
    weaknesses.push("Belirgin bir zayıflık tespit edilmemiştir, ancak profesyonel değerlendirme önerilir.");
  }

  return weaknesses;
}

function calculateWinProbability(
  eventSummary: string,
  category: CaseCategory,
  strengths: string[],
  weaknesses: string[],
  matchedPrecedents: (Omit<Precedent, "id" | "created_at"> & { relevance_score: number })[]
): number {
  let baseScore = 50;

  // Strengths boost
  baseScore += strengths.length * 5;

  // Weaknesses penalty
  baseScore -= weaknesses.length * 4;

  // Precedent analysis
  const favorableCount = matchedPrecedents.filter(
    (p) => p.outcome === "plaintiff_won"
  ).length;
  const unfavorableCount = matchedPrecedents.filter(
    (p) => p.outcome === "defendant_won"
  ).length;

  baseScore += favorableCount * 8;
  baseScore -= unfavorableCount * 8;

  // Relevance score bonus
  const avgRelevance =
    matchedPrecedents.reduce((sum, p) => sum + p.relevance_score, 0) /
    (matchedPrecedents.length || 1);
  baseScore += avgRelevance * 10;

  // Detail bonus
  const wordCount = eventSummary.split(/\s+/).length;
  if (wordCount > 100) baseScore += 5;
  if (wordCount > 200) baseScore += 5;

  // Clamp between 15 and 92
  return Math.max(15, Math.min(92, Math.round(baseScore)));
}

function generateReport(
  eventSummary: string,
  category: CaseCategory,
  winProbability: number,
  strengths: string[],
  weaknesses: string[],
  matchedPrecedents: (Omit<Precedent, "id" | "created_at"> & { relevance_score: number })[]
): string {
  const recommendation =
    winProbability >= 65
      ? "DAVA AÇILMASI TAVSİYE EDİLİR"
      : winProbability >= 40
      ? "DETAYLI AVUKAT DEĞERLENDİRMESİ GEREKLİDİR"
      : "DAVA AÇILMASI ÖNERİLMEZ";

  let report = `# Haklarım Hukuki Analiz Raporu\n\n`;
  report += `## Genel Değerlendirme\n`;
  report += `**Kazanma Olasılığı:** %${winProbability}\n`;
  report += `**Tavsiye:** ${recommendation}\n\n`;

  report += `## Güçlü Yanlar\n`;
  strengths.forEach((s) => {
    report += `- ✓ ${s}\n`;
  });

  report += `\n## Zayıf Yanlar ve Riskler\n`;
  weaknesses.forEach((w) => {
    report += `- ⚠ ${w}\n`;
  });

  report += `\n## Emsal Karar Analizi\n`;
  matchedPrecedents.forEach((p, i) => {
    report += `\n### ${i + 1}. ${p.court} - ${p.case_number}\n`;
    report += `**Tarih:** ${p.date}\n`;
    report += `**Özet:** ${p.summary}\n`;
    report += `**Karar:** ${p.ruling}\n`;
    report += `**Benzerlik Oranı:** %${Math.round(p.relevance_score * 100)}\n`;
    report += `**Sonuç:** ${p.outcome === "plaintiff_won" ? "Davacı Lehine" : p.outcome === "defendant_won" ? "Davalı Lehine" : "Uzlaşma/Red"}\n`;
  });

  report += `\n## Sonraki Adımlar\n`;
  if (winProbability >= 65) {
    report += `1. Bu raporu bir avukata gösterin.\n`;
    report += `2. Tüm belgeleri ve kanıtları derleyin.\n`;
    report += `3. Zamanaşımı sürelerini kontrol edin.\n`;
    report += `4. Arabuluculuk sürecini değerlendirin.\n`;
  } else if (winProbability >= 40) {
    report += `1. Mutlaka bir avukata danışın.\n`;
    report += `2. Ek delil ve belge toplayın.\n`;
    report += `3. Arabuluculuk veya sulh yollarını değerlendirin.\n`;
    report += `4. Dava maliyetlerini göz önünde bulundurun.\n`;
  } else {
    report += `1. Dava açmadan önce avukat görüşü alın.\n`;
    report += `2. Alternatif çözüm yollarını araştırın.\n`;
    report += `3. Mevcut delillerinizi güçlendirmeye çalışın.\n`;
    report += `4. Hukuki sürecin maliyetini ve risklerini değerlendirin.\n`;
  }

  report += `\n---\n*Bu rapor Haklarım AI tarafından oluşturulmuştur. Kesin hukuki tavsiye niteliği taşımaz. Profesyonel hukuki danışmanlık almanız tavsiye edilir.*`;

  return report;
}

export function analyzeCase(
  eventSummary: string,
  category: CaseCategory,
  additionalNotes?: string
): AnalysisResult {
  const fullText = additionalNotes
    ? `${eventSummary} ${additionalNotes}`
    : eventSummary;

  const matchedPrecedents = findMatchingPrecedents(fullText, category);
  const strengths = analyzeStrengths(fullText, category, matchedPrecedents);
  const weaknesses = analyzeWeaknesses(fullText, category, matchedPrecedents);
  const winProbability = calculateWinProbability(
    fullText,
    category,
    strengths,
    weaknesses,
    matchedPrecedents
  );

  const recommendation: AnalysisResult["recommendation"] =
    winProbability >= 65
      ? "file_case"
      : winProbability >= 40
      ? "needs_review"
      : "do_not_file";

  const analysisReport = generateReport(
    fullText,
    category,
    winProbability,
    strengths,
    weaknesses,
    matchedPrecedents
  );

  const riskFactors: string[] = [];
  if (winProbability < 40) riskFactors.push("Düşük kazanma olasılığı");
  if (weaknesses.length > strengths.length) riskFactors.push("Zayıf yanlar güçlü yanlardan fazla");
  if (matchedPrecedents.every((p) => p.outcome === "defendant_won"))
    riskFactors.push("Emsal kararlar aleyhte");

  const suggestedActions: string[] = [
    "Tüm belge ve kanıtlarınızı düzenli bir dosya halinde saklayın.",
    "Zamanaşımı sürelerini kontrol edin.",
    winProbability >= 50
      ? "Bir avukatla görüşerek dava stratejinizi belirleyin."
      : "Arabuluculuk veya uzlaşma yollarını değerlendirin.",
  ];

  // Süre tahmini
  const wordCount = fullText.split(/\s+/).length;
  const complexity = wordCount > 200 ? "high" : wordCount > 80 ? "medium" : "low";
  const estimatedDuration = estimateCaseDuration(category, complexity, matchedPrecedents);

  return {
    winProbability,
    strengths,
    weaknesses,
    recommendation,
    analysisReport,
    matchedPrecedents: matchedPrecedents as (Precedent & { relevance_score: number })[],
    riskFactors,
    suggestedActions,
    estimatedDuration,
  };
}
