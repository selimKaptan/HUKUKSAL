import type { CaseCategory } from "@/types/database";

export interface MediationInput {
  category: CaseCategory;
  claimAmount: number;
  estimatedDuration: number; // ay
  hasLawyer: boolean;
  complexity: "low" | "medium" | "high";
}

export interface MediationResult {
  lawsuit: {
    totalCost: number;
    lawyerFee: number;
    courtFee: number;
    expertFee: number;
    otherCosts: number;
    estimatedDuration: string;
    successRate: number;
  };
  mediation: {
    totalCost: number;
    mediatorFee: number;
    lawyerFee: number;
    estimatedDuration: string;
    successRate: number;
  };
  savings: number;
  timeSaved: string;
  recommendation: "lawsuit" | "mediation" | "both";
  explanation: string;
}

const MANDATORY_MEDIATION: CaseCategory[] = [
  "is_hukuku",
  "ticaret_hukuku",
  "tuketici_hukuku",
  "kira_hukuku",
];

export function calculateMediation(input: MediationInput): MediationResult {
  const { category, claimAmount, estimatedDuration, hasLawyer, complexity } = input;
  const isMandatory = MANDATORY_MEDIATION.includes(category);

  // === DAVA MASRAFLARI ===

  // Mahkeme harcı (nispi harç %6.84)
  const courtFee = Math.max(200, claimAmount * 0.0684);

  // Avukat ücreti - süreye göre artar (uzun dava = daha fazla duruşma = daha fazla ücret)
  const baseLawyerRate = 0.12; // %12 temel oran
  const durationMultiplier = 1 + (estimatedDuration / 24) * 0.25; // Her 24 ay için %25 artış
  const lawyerFeeLawsuit = hasLawyer
    ? Math.round(Math.max(5000, claimAmount * baseLawyerRate * durationMultiplier))
    : 0;

  // Bilirkişi - karmaşıklığa VE süreye göre (uzun dava birden fazla bilirkişi gerektirebilir)
  const baseExpertFee = complexity === "high" ? 5000 : complexity === "medium" ? 3000 : 1500;
  const expertRounds = estimatedDuration > 36 ? 3 : estimatedDuration > 18 ? 2 : 1;
  const expertFee = baseExpertFee * expertRounds;

  // Diğer masraflar - süreyle doğru orantılı
  const otherCosts = 1500 + (estimatedDuration * 300); // tebligat, posta, yol, dosya masrafı

  const totalLawsuit = courtFee + lawyerFeeLawsuit + expertFee + otherCosts;

  // === ARABULUCULUK MASRAFLARI ===

  // Arabulucu ücreti (talep tutarına göre kademeli)
  let mediatorFee: number;
  if (claimAmount <= 100000) {
    mediatorFee = Math.max(1500, claimAmount * 0.03);
  } else if (claimAmount <= 500000) {
    mediatorFee = 3000 + (claimAmount - 100000) * 0.02;
  } else {
    mediatorFee = 11000 + (claimAmount - 500000) * 0.01;
  }

  // Avukat ücreti (arabuluculukta daha düşük)
  const lawyerFeeMediation = hasLawyer
    ? Math.round(Math.max(2000, claimAmount * 0.04))
    : 0;

  const totalMediation = mediatorFee + lawyerFeeMediation;

  // === SÜRE HESABI ===
  const lawsuitDuration = estimatedDuration;
  // Arabuluculuk süresi: dava süresinin %10-15'i, min 1, max 6 ay
  const mediationDuration = Math.max(1, Math.min(6, Math.ceil(estimatedDuration * 0.1)));

  // === BAŞARI ORANLARI ===
  const mediationSuccessRates: Record<string, number> = {
    is_hukuku: 72,
    ticaret_hukuku: 65,
    tuketici_hukuku: 68,
    kira_hukuku: 60,
    aile_hukuku: 55,
    ceza_hukuku: 30,
    miras_hukuku: 40,
    idare_hukuku: 25,
    icra_iflas: 45,
    default: 50,
  };
  const mediationSuccess = mediationSuccessRates[category] || mediationSuccessRates.default;

  // Dava başarı oranı - süre uzadıkça belirsizlik artar
  const lawsuitSuccess = estimatedDuration > 48 ? 45 : estimatedDuration > 24 ? 50 : 55;

  const savings = totalLawsuit - totalMediation;
  const timeSavedMonths = lawsuitDuration - mediationDuration;

  // === TAVSİYE MANTIGI ===
  let recommendation: "lawsuit" | "mediation" | "both";
  let explanation: string;

  const costRatio = totalMediation / totalLawsuit; // Arabuluculuk/Dava maliyet oranı
  const isVeryLong = estimatedDuration > 36; // 3 yıldan uzun
  const isLong = estimatedDuration > 18; // 1.5 yıldan uzun

  if (isMandatory) {
    recommendation = "mediation";
    const categoryName = category === "is_hukuku" ? "İş" : category === "ticaret_hukuku" ? "Ticaret" : category === "tuketici_hukuku" ? "Tüketici" : "Kira";
    explanation = `${categoryName} hukukunda arabuluculuk zorunludur. Dava açmadan önce arabuluculuk sürecini tamamlamanız gerekmektedir. ` +
      `Arabuluculukta anlaşma sağlanamazsa dava yoluna gidebilirsiniz. ` +
      `Arabuluculuk ile ${savings.toLocaleString("tr-TR")} TL tasarruf edebilir ve ${timeSavedMonths} ay daha kısa sürede sonuç alabilirsiniz. ` +
      `Bu kategoride arabuluculuk başarı oranı %${mediationSuccess}'dir.`;
  } else if (isVeryLong && costRatio < 0.5) {
    // Çok uzun dava + arabuluculuk çok daha ucuz
    recommendation = "mediation";
    explanation = `Tahmini dava süresi ${estimatedDuration} ay (${(estimatedDuration / 12).toFixed(1)} yıl) çok uzundur. ` +
      `Bu süreçte toplam ${totalLawsuit.toLocaleString("tr-TR")} TL masraf çıkacaktır. ` +
      `Arabuluculuk ile ${mediationDuration} ayda ${totalMediation.toLocaleString("tr-TR")} TL maliyetle sonuç alabilirsiniz. ` +
      `Tasarruf: ${savings.toLocaleString("tr-TR")} TL ve ${timeSavedMonths} ay zaman. ` +
      `${estimatedDuration} ay boyunca dava stresi ve belirsizlik de göz önüne alındığında arabuluculuk güçlü bir alternatiftir.`;
  } else if (isLong && mediationSuccess >= 50) {
    // Uzun dava + arabuluculuk başarı şansı makul
    recommendation = "both";
    explanation = `Dava süresi ${estimatedDuration} ay (${(estimatedDuration / 12).toFixed(1)} yıl) olarak tahmin edilmektedir. ` +
      `Önce arabuluculuk denemeniz tavsiye edilir (%${mediationSuccess} başarı oranı). ` +
      `Arabuluculukta anlaşma sağlanamazsa dava yoluna gidebilirsiniz. ` +
      `Arabuluculuk başarılı olursa ${savings.toLocaleString("tr-TR")} TL ve ${timeSavedMonths} ay tasarruf edersiniz.`;
  } else if (complexity === "high" && claimAmount > 500000 && !isVeryLong) {
    // Yüksek tutarlı, karmaşık ama çok uzun olmayan dava
    recommendation = "lawsuit";
    explanation = `Talep tutarı ${claimAmount.toLocaleString("tr-TR")} TL ve karmaşıklık yüksek. ` +
      `Mahkeme yoluyla daha güçlü bir sonuç elde edebilirsiniz. ` +
      `Dava maliyeti: ${totalLawsuit.toLocaleString("tr-TR")} TL, tahmini süre: ${estimatedDuration} ay. ` +
      `Ancak arabuluculuk da (${totalMediation.toLocaleString("tr-TR")} TL, ${mediationDuration} ay) denemeye değer bir alternatiftir.`;
  } else if (savings > claimAmount * 0.05) {
    recommendation = "mediation";
    explanation = `Arabuluculuk yoluyla ${savings.toLocaleString("tr-TR")} TL tasarruf edebilir ve ` +
      `${timeSavedMonths} ay daha kısa sürede sonuç alabilirsiniz. ` +
      `Bu kategoride arabuluculuk başarı oranı %${mediationSuccess}'dir. ` +
      `Dava masrafı: ${totalLawsuit.toLocaleString("tr-TR")} TL (${estimatedDuration} ay) vs ` +
      `Arabuluculuk: ${totalMediation.toLocaleString("tr-TR")} TL (${mediationDuration} ay).`;
  } else {
    recommendation = "both";
    explanation = `Önce arabuluculuk denemeniz, anlaşma sağlanamazsa dava yoluna gitmeniz önerilir. ` +
      `Dava maliyeti: ${totalLawsuit.toLocaleString("tr-TR")} TL (${estimatedDuration} ay), ` +
      `Arabuluculuk: ${totalMediation.toLocaleString("tr-TR")} TL (${mediationDuration} ay). ` +
      `Tasarruf potansiyeli: ${savings.toLocaleString("tr-TR")} TL ve ${timeSavedMonths} ay.`;
  }

  return {
    lawsuit: {
      totalCost: Math.round(totalLawsuit),
      lawyerFee: Math.round(lawyerFeeLawsuit),
      courtFee: Math.round(courtFee),
      expertFee,
      otherCosts: Math.round(otherCosts),
      estimatedDuration: `${lawsuitDuration} ay`,
      successRate: lawsuitSuccess,
    },
    mediation: {
      totalCost: Math.round(totalMediation),
      mediatorFee: Math.round(mediatorFee),
      lawyerFee: Math.round(lawyerFeeMediation),
      estimatedDuration: `${mediationDuration} ay`,
      successRate: mediationSuccess,
    },
    savings: Math.round(savings),
    timeSaved: `${timeSavedMonths} ay`,
    recommendation,
    explanation,
  };
}
