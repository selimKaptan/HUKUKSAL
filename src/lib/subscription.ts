/**
 * Kullanım limiti ve abonelik yönetimi
 */

export interface UserSubscription {
  planId: string;
  startDate: string;
  endDate: string;
  analysisUsed: number;
  analysisLimit: number; // -1 = sınırsız
  status: "active" | "expired" | "cancelled";
}

const STORAGE_KEY = "jg_subscription";

export function getUserSubscription(userId: string): UserSubscription {
  if (typeof window === "undefined") {
    return getDefaultSubscription();
  }

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      const sub: UserSubscription = JSON.parse(stored);
      // Süre kontrolü
      if (new Date(sub.endDate) < new Date() && sub.planId !== "free") {
        sub.status = "expired";
        saveSubscription(userId, sub);
      }
      return sub;
    }
  } catch { /* ignore */ }

  return getDefaultSubscription();
}

function getDefaultSubscription(): UserSubscription {
  return {
    planId: "free",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    analysisUsed: 0,
    analysisLimit: 3,
    status: "active",
  };
}

export function saveSubscription(userId: string, sub: UserSubscription): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(sub));
}

export function activatePlan(userId: string, planId: string): void {
  const isYearly = planId.includes("yearly");
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + (isYearly ? 12 : 1));

  const sub: UserSubscription = {
    planId,
    startDate: new Date().toISOString(),
    endDate: endDate.toISOString(),
    analysisUsed: 0,
    analysisLimit: planId === "free" ? 3 : -1,
    status: "active",
  };

  saveSubscription(userId, sub);
}

export function canMakeAnalysis(userId: string): { allowed: boolean; remaining: number; message?: string } {
  const sub = getUserSubscription(userId);

  if (sub.status !== "active") {
    return { allowed: false, remaining: 0, message: "Aboneliğiniz sona ermiş. Lütfen plan yenileyin." };
  }

  if (sub.analysisLimit === -1) {
    return { allowed: true, remaining: -1 }; // Sınırsız
  }

  const remaining = sub.analysisLimit - sub.analysisUsed;
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, message: "Ücretsiz analiz hakkınız dolmuş. Pro plana geçin." };
  }

  return { allowed: true, remaining };
}

export function incrementAnalysisUsage(userId: string): void {
  const sub = getUserSubscription(userId);
  sub.analysisUsed += 1;
  saveSubscription(userId, sub);
}
