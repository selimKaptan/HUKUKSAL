"use client";

/**
 * Haklarım - Freemium Özellik Matrisi & Feature Gate Sistemi
 *
 * STRATEJİ:
 * 1. Login olmadan: Temel analiz (1 adet), araçlar, avukat arama, sözlük, hukuk hesaplayıcılar
 * 2. Ücretsiz üye: 3 analiz/ay, mesajlaşma, analiz geçmişi, avukat arama
 * 3. Pro üye: Sınırsız analiz, PDF indirme, AI sohbet, öncelikli destek, detaylı raporlar
 */

export type PlanType = "guest" | "free" | "pro";

export interface PlanFeature {
  id: string;
  name: string;
  guest: boolean | number | string;
  free: boolean | number | string;
  pro: boolean | number | string;
}

// Özellik matrisi
export const FEATURE_MATRIX: PlanFeature[] = [
  { id: "basic_analysis", name: "Temel Dava Analizi", guest: 1, free: 3, pro: "Sınırsız" },
  { id: "precedent_search", name: "Emsal Karar Arama", guest: true, free: true, pro: true },
  { id: "legal_tools", name: "Hukuk Araçları (Zamanaşımı, Arabuluculuk, Harç)", guest: true, free: true, pro: true },
  { id: "glossary", name: "Hukuk Sözlüğü", guest: true, free: true, pro: true },
  { id: "lawyer_search", name: "Avukat Arama", guest: true, free: true, pro: true },
  { id: "find_lawyer_message", name: "Avukata Mesaj Gönderme", guest: false, free: true, pro: true },
  { id: "messaging", name: "Mesajlaşma", guest: false, free: true, pro: true },
  { id: "analysis_history", name: "Analiz Geçmişi", guest: false, free: true, pro: true },
  { id: "pdf_download", name: "PDF Rapor İndirme", guest: false, free: false, pro: true },
  { id: "ai_chat", name: "AI Hukuk Asistanı (Sohbet)", guest: false, free: false, pro: true },
  { id: "detailed_report", name: "Detaylı Analiz Raporu", guest: false, free: false, pro: true },
  { id: "document_analysis", name: "Belge Analizi (OCR)", guest: false, free: false, pro: true },
  { id: "priority_support", name: "Öncelikli Destek", guest: false, free: false, pro: true },
  { id: "unlimited_messages", name: "Sınırsız Mesajlaşma", guest: false, free: "10/gün", pro: "Sınırsız" },
];

// Plan bilgileri
export const PLANS = {
  guest: {
    id: "guest",
    name: "Misafir",
    price: 0,
    description: "Kayıt olmadan deneyin",
    color: "slate",
  },
  free: {
    id: "free",
    name: "Ücretsiz",
    price: 0,
    description: "Temel özelliklerle başlayın",
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
  guest: {
    analysisPerMonth: 1,
    messagesPerDay: 0,
    aiChatPerDay: 0,
  },
  free: {
    analysisPerMonth: 3,
    messagesPerDay: 10,
    aiChatPerDay: 0,
  },
  pro: {
    analysisPerMonth: Infinity,
    messagesPerDay: Infinity,
    aiChatPerDay: Infinity,
  },
};

// Kullanıcının plan tipini belirle
export function getUserPlan(user: { id: string; email?: string; plan?: string } | null): PlanType {
  if (!user) return "guest";
  if (user.plan === "pro") return "pro";
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
  messageCount: number;
  messageResetDate: string;
}

function getUsage(): UsageData {
  if (typeof window === "undefined") {
    return { analysisCount: 0, analysisResetDate: "", messageCount: 0, messageResetDate: "" };
  }
  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (!stored) return { analysisCount: 0, analysisResetDate: new Date().toISOString().slice(0, 7), messageCount: 0, messageResetDate: new Date().toISOString().slice(0, 10) };
    return JSON.parse(stored);
  } catch {
    return { analysisCount: 0, analysisResetDate: "", messageCount: 0, messageResetDate: "" };
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
    return 0; // Yeni ay, sıfırla
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

export function getMessageCount(): number {
  const usage = getUsage();
  const today = new Date().toISOString().slice(0, 10);
  if (usage.messageResetDate !== today) return 0;
  return usage.messageCount;
}

export function incrementMessageCount(): void {
  const usage = getUsage();
  const today = new Date().toISOString().slice(0, 10);
  if (usage.messageResetDate !== today) {
    usage.messageCount = 1;
    usage.messageResetDate = today;
  } else {
    usage.messageCount += 1;
  }
  saveUsage(usage);
}
