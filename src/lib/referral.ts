/**
 * Referans Sistemi - "Arkadaşını Davet Et, Analiz Kazan"
 */

export interface Referral {
  referrerUserId: string;
  referredEmail: string;
  referralCode: string;
  createdAt: string;
  completed: boolean; // Davet edilen kişi kayıt oldu mu
  rewarded: boolean;  // Ödül verildi mi
}

const REFERRALS_KEY = "jg_referrals";

export function generateReferralCode(userId: string): string {
  const stored = localStorage.getItem(`jg_refcode_${userId}`);
  if (stored) return stored;

  const code = `JG-${userId.slice(-4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  localStorage.setItem(`jg_refcode_${userId}`, code);
  return code;
}

export function getReferralCode(userId: string): string {
  return localStorage.getItem(`jg_refcode_${userId}`) || generateReferralCode(userId);
}

export function getReferralLink(userId: string): string {
  const code = getReferralCode(userId);
  const base = typeof window !== "undefined" ? window.location.origin : "https://hukuksal.vercel.app";
  return `${base}/auth/register?ref=${code}`;
}

export function getReferrals(userId: string): Referral[] {
  try {
    const all: Referral[] = JSON.parse(localStorage.getItem(REFERRALS_KEY) || "[]");
    return all.filter((r) => r.referrerUserId === userId);
  } catch { return []; }
}

export function addReferral(referrerCode: string, referredEmail: string): void {
  // Kodu referrer userId'ye çevir
  const allCodes = Object.keys(localStorage).filter((k) => k.startsWith("jg_refcode_"));
  let referrerUserId = "";
  for (const key of allCodes) {
    if (localStorage.getItem(key) === referrerCode) {
      referrerUserId = key.replace("jg_refcode_", "");
      break;
    }
  }

  if (!referrerUserId) return;

  const referrals: Referral[] = JSON.parse(localStorage.getItem(REFERRALS_KEY) || "[]");

  // Aynı email zaten davet edilmiş mi
  if (referrals.find((r) => r.referredEmail === referredEmail)) return;

  referrals.push({
    referrerUserId,
    referredEmail,
    referralCode: referrerCode,
    createdAt: new Date().toISOString(),
    completed: true,
    rewarded: false,
  });

  localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals));

  // Referrer'a 1 ek analiz hakkı ver
  rewardReferrer(referrerUserId);
}

function rewardReferrer(userId: string): void {
  const subKey = `jg_subscription_${userId}`;
  try {
    const sub = JSON.parse(localStorage.getItem(subKey) || "{}");
    if (sub.analysisLimit && sub.analysisLimit > 0) {
      sub.analysisLimit += 1;
      localStorage.setItem(subKey, JSON.stringify(sub));
    }
  } catch { /* ignore */ }
}

export function getReferralStats(userId: string): { totalInvites: number; completedInvites: number; earnedAnalyses: number } {
  const referrals = getReferrals(userId);
  return {
    totalInvites: referrals.length,
    completedInvites: referrals.filter((r) => r.completed).length,
    earnedAnalyses: referrals.filter((r) => r.completed).length,
  };
}
