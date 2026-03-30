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

// Zorunlu arabuluculuk kategorileri
const MANDATORY_MEDIATION: CaseCategory[] = [
  "is_hukuku",
  "ticaret_hukuku",
  "tuketici_hukuku",
  "kira_hukuku",
];

export function calculateMediation(input: MediationInput): MediationResult {
  const { category, claimAmount, estimatedDuration, hasLawyer, complexity } = input;
  const isMandatory = MANDATORY_MEDIATION.includes(category);

  // Dava masrafları
  const courtFee = Math.max(200, claimAmount * 0.0684); // Nispi harç
  const lawyerFeeLawsuit = hasLawyer ? Math.max(5000, claimAmount * 0.12) : 0;
  const expertFee = complexity === "high" ? 5000 : complexity === "medium" ? 3000 : 1500;
  const otherCosts = 1500 + (estimatedDuration * 200); // tebligat, posta, yol
  const totalLawsuit = courtFee + lawyerFeeLawsuit + expertFee + otherCosts;

  // Arabuluculuk masrafları
  const mediatorFee = Math.max(1500, claimAmount * 0.02);
  const lawyerFeeMediation = hasLawyer ? Math.max(2000, claimAmount * 0.05) : 0;
  const totalMediation = mediatorFee + lawyerFeeMediation;

  // Süre
  const lawsuitDuration = estimatedDuration;
  const mediationDuration = Math.max(1, Math.ceil(estimatedDuration * 0.15));

  // Başarı oranları
  const mediationSuccessRates: Record<string, number> = {
    is_hukuku: 72,
    ticaret_hukuku: 65,
    tuketici_hukuku: 68,
    kira_hukuku: 60,
    aile_hukuku: 55,
    default: 50,
  };
  const mediationSuccess = mediationSuccessRates[category] || mediationSuccessRates.default;
  const lawsuitSuccess = 55; // Ortalama

  const savings = totalLawsuit - totalMediation;
  const timeSavedMonths = lawsuitDuration - mediationDuration;

  let recommendation: "lawsuit" | "mediation" | "both";
  let explanation: string;

  if (isMandatory) {
    recommendation = "mediation";
    explanation = `${category === "is_hukuku" ? "İş" : category === "ticaret_hukuku" ? "Ticaret" : category === "tuketici_hukuku" ? "Tüketici" : "Kira"} hukukunda arabuluculuk zorunludur. Dava açmadan önce arabuluculuk sürecini tamamlamanız gerekmektedir. Arabuluculukta anlaşma sağlanamazsa dava yoluna gidebilirsiniz.`;
  } else if (savings > claimAmount * 0.1 && mediationSuccess > 55) {
    recommendation = "mediation";
    explanation = `Arabuluculuk yoluyla ${savings.toLocaleString("tr-TR")} TL tasarruf edebilir ve ${timeSavedMonths} ay daha kısa sürede sonuç alabilirsiniz. Bu kategoride arabuluculuk başarı oranı %${mediationSuccess}'dir.`;
  } else if (complexity === "high" || claimAmount > 500000) {
    recommendation = "lawsuit";
    explanation = `Davanızın karmaşıklığı ve talep miktarı göz önüne alındığında, mahkeme yoluyla daha güçlü bir sonuç elde edebilirsiniz. Ancak arabuluculuk da denemeye değer bir alternatiftir.`;
  } else {
    recommendation = "both";
    explanation = `Önce arabuluculuk denemeniz, anlaşma sağlanamazsa dava yoluna gitmeniz önerilir. Bu şekilde hem zaman hem maliyet avantajı elde edebilirsiniz.`;
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
