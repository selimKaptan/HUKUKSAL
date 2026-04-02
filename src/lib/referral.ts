"use client";

/**
 * Paylaş → Analiz Kazan sistemi
 */

const REFERRAL_KEY = "hklrm_referral";
const BONUS_KEY = "hklrm_bonus_analyses";

interface ReferralData {
  shareCount: number;
  bonusEarned: number;
  lastShareDate: string;
}

function getData(): ReferralData {
  if (typeof window === "undefined") return { shareCount: 0, bonusEarned: 0, lastShareDate: "" };
  try {
    return JSON.parse(localStorage.getItem(REFERRAL_KEY) || '{"shareCount":0,"bonusEarned":0,"lastShareDate":""}');
  } catch { return { shareCount: 0, bonusEarned: 0, lastShareDate: "" }; }
}

export function getShareLink(): string {
  return "https://haklarim.app";
}

export function getShareText(): string {
  return "Hukuki haklarını öğrenmek için Haklarım uygulamasını dene! AI avukatına ücretsiz soru sorabilirsin 🏛️";
}

export function recordShare(): { bonusGranted: boolean; totalBonus: number } {
  const data = getData();
  const today = new Date().toISOString().slice(0, 10);

  data.shareCount += 1;

  // Her 3 paylaşımda 1 bonus analiz hakkı
  let bonusGranted = false;
  if (data.shareCount % 3 === 0) {
    data.bonusEarned += 1;
    bonusGranted = true;

    const currentBonus = parseInt(localStorage.getItem(BONUS_KEY) || "0");
    localStorage.setItem(BONUS_KEY, String(currentBonus + 1));
  }

  data.lastShareDate = today;
  localStorage.setItem(REFERRAL_KEY, JSON.stringify(data));

  return { bonusGranted, totalBonus: data.bonusEarned };
}

export function getBonusAnalyses(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(BONUS_KEY) || "0");
}

export function useBonusAnalysis(): boolean {
  const bonus = getBonusAnalyses();
  if (bonus <= 0) return false;
  localStorage.setItem(BONUS_KEY, String(bonus - 1));
  return true;
}

export async function shareApp(): Promise<boolean> {
  const shareData = {
    title: "Haklarım - AI Hukuk Asistanı",
    text: getShareText(),
    url: getShareLink(),
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return true;
    }
    // Fallback: clipboard
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    return true;
  } catch {
    return false;
  }
}
