"use client";

/**
 * Haklarım - Freemium Özellik Sistemi
 *
 * STRATEJİ (Basit):
 * - Ücretsiz (login olsun/olmasın): 3 analiz/ay, mesajlaşma, tüm araçlar
 * - Login farkı: Sadece geçmiş kaydedilir
 * - Pro: Sınırsız analiz, PDF, AI sohbet, belge analizi
 */

export type PlanType = "free" | "pro";

export interface PlanFeature {
  id: string;
  name: string;
  free: boolean | number | string;
  pro: boolean | number | string;
}

// Özellik matrisi
export const FEATURE_MATRIX: PlanFeature[] = [
  { id: "basic_analysis", name: "Dava Analizi", free: "3/ay", pro: "Sınırsız" },
  { id: "precedent_search", name: "Emsal Karar Arama", free: true, pro: true },
  { id: "legal_tools", name: "Hukuk Araçları (Zamanaşımı, Arabuluculuk, Harç)", free: true, pro: true },
  { id: "glossary", name: "Hukuk Sözlüğü", free: true, pro: true },
  { id: "lawyer_search", name: "Avukat Arama", free: true, pro: true },
  { id: "messaging", name: "Mesajlaşma", free: true, pro: "Sınırsız" },
  { id: "analysis_history", name: "Analiz Geçmişi (login ile)", free: true, pro: true },
  { id: "pdf_download", name: "PDF Rapor İndirme", free: false, pro: true },
  { id: "ai_chat", name: "AI Hukuk Asistanı (Sohbet)", free: false, pro: true },
  { id: "document_analysis", name: "Belge Analizi (OCR)", free: false, pro: true },
  { id: "detailed_report", name: "Detaylı Analiz Raporu", free: false, pro: true },
  { id: "priority_support", name: "Öncelikli Destek", free: false, pro: true },
];

// Plan bilgileri
export const PLANS = {
  free: {
    id: "free",
    name: "Ücretsiz",
    price: 0,
    description: "Hemen kullanmaya başlayın",
    color: "blue",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 149,
    priceYearly: 1199,
    description: "Tüm özellikler, sınırsız kullanım",
    color: "indigo",
    badge: "En Popüler",
  },
};

// Kullanım limitleri
export const USAGE_LIMITS = {
  free: {
    analysisPerMonth: 3,
    aiChatPerDay: 0,
  },
  pro: {
    analysisPerMonth: Infinity,
    aiChatPerDay: Infinity,
  },
};

// Kullanıcının plan tipini belirle
export function getUserPlan(user: { id?: string; email?: string; plan?: string } | null): PlanType {
  if (user?.plan === "pro") return "pro";
  return "free";
}

// Özelliğe erişim kontrolü
export function canAccess(plan: PlanType, featureId: string): boolean {
  const feature = FEATURE_MATRIX.find((f) => f.id === featureId);
  if (!feature) return false;
  const value = feature[plan];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") return true;
  return false;
}

// Kullanım sayısı kontrolü
const USAGE_KEY = "hklrm_usage";

interface UsageData {
  analysisCount: number;
  analysisResetDate: string;
}

function getUsage(): UsageData {
  if (typeof window === "undefined") {
    return { analysisCount: 0, analysisResetDate: "" };
  }
  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (!stored) return { analysisCount: 0, analysisResetDate: new Date().toISOString().slice(0, 7) };
    return JSON.parse(stored);
  } catch {
    return { analysisCount: 0, analysisResetDate: "" };
  }
}

function saveUsage(usage: UsageData) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  }
}

export function getAnalysisCount(): number {
  const usage = getUsage();
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (usage.analysisResetDate !== currentMonth) {
    return 0;
  }
  return usage.analysisCount;
}

export function incrementAnalysisCount(): void {
  const usage = getUsage();
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (usage.analysisResetDate !== currentMonth) {
    usage.analysisCount = 1;
    usage.analysisResetDate = currentMonth;
  } else {
    usage.analysisCount += 1;
  }
  saveUsage(usage);
}

export function canDoAnalysis(plan: PlanType): { allowed: boolean; remaining: number; limit: number } {
  const limit = USAGE_LIMITS[plan].analysisPerMonth;
  if (limit === Infinity) return { allowed: true, remaining: Infinity, limit: Infinity };
  const used = getAnalysisCount();
  return { allowed: used < limit, remaining: Math.max(0, limit - used), limit };
}
