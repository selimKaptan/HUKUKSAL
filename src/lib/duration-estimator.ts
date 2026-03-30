import type { CaseCategory, AnalysisResult } from "@/types/database";
import { PRECEDENTS_DB } from "./precedents-data";

interface CategoryDurationProfile {
  minDays: number;
  maxDays: number;
  avgDays: number;
  phases: { name: string; duration: string }[];
}

// Türk yargı sistemindeki ortalama dava süreleri (Adalet Bakanlığı verileri baz alınarak)
const CATEGORY_DURATIONS: Record<CaseCategory, CategoryDurationProfile> = {
  is_hukuku: {
    minDays: 180,
    maxDays: 720,
    avgDays: 420,
    phases: [
      { name: "Zorunlu Arabuluculuk", duration: "2-4 hafta" },
      { name: "Dava Açılışı & Tensip", duration: "1-2 hafta" },
      { name: "Ön İnceleme Duruşması", duration: "1-3 ay" },
      { name: "Tahkikat (Delil Toplama & Tanık)", duration: "3-8 ay" },
      { name: "Bilirkişi İncelemesi", duration: "2-4 ay" },
      { name: "Karar Duruşması", duration: "1-2 ay" },
      { name: "İstinaf (Bölge Adliye)", duration: "3-6 ay" },
      { name: "Temyiz (Yargıtay)", duration: "6-12 ay" },
    ],
  },
  aile_hukuku: {
    minDays: 90,
    maxDays: 730,
    avgDays: 390,
    phases: [
      { name: "Dava Dilekçesi & Tensip", duration: "1-2 hafta" },
      { name: "Ön İnceleme", duration: "1-2 ay" },
      { name: "Sosyal İnceleme Raporu", duration: "1-3 ay" },
      { name: "Tahkikat Aşaması", duration: "2-6 ay" },
      { name: "Karar", duration: "1-2 ay" },
      { name: "İstinaf", duration: "3-6 ay" },
      { name: "Temyiz (Yargıtay)", duration: "6-12 ay" },
    ],
  },
  ticaret_hukuku: {
    minDays: 240,
    maxDays: 900,
    avgDays: 510,
    phases: [
      { name: "Zorunlu Arabuluculuk", duration: "2-4 hafta" },
      { name: "Dava Açılışı", duration: "1-2 hafta" },
      { name: "Ön İnceleme", duration: "1-3 ay" },
      { name: "Bilirkişi İncelemesi", duration: "3-6 ay" },
      { name: "Tahkikat", duration: "3-8 ay" },
      { name: "Karar", duration: "1-2 ay" },
      { name: "İstinaf & Temyiz", duration: "6-18 ay" },
    ],
  },
  ceza_hukuku: {
    minDays: 120,
    maxDays: 1080,
    avgDays: 450,
    phases: [
      { name: "Soruşturma (Savcılık)", duration: "1-6 ay" },
      { name: "İddianame & Tensip", duration: "1-2 ay" },
      { name: "Kovuşturma (Duruşmalar)", duration: "3-12 ay" },
      { name: "Karar", duration: "1-2 ay" },
      { name: "İstinaf", duration: "3-6 ay" },
      { name: "Temyiz (Yargıtay)", duration: "6-12 ay" },
    ],
  },
  tuketici_hukuku: {
    minDays: 30,
    maxDays: 540,
    avgDays: 240,
    phases: [
      { name: "Tüketici Hakem Heyeti (66.000 TL altı)", duration: "1-3 ay" },
      { name: "Tüketici Mahkemesi Dava Açılışı", duration: "1-2 hafta" },
      { name: "Bilirkişi İncelemesi", duration: "2-4 ay" },
      { name: "Tahkikat & Karar", duration: "2-6 ay" },
      { name: "İstinaf", duration: "3-6 ay" },
    ],
  },
  kira_hukuku: {
    minDays: 120,
    maxDays: 600,
    avgDays: 330,
    phases: [
      { name: "Zorunlu Arabuluculuk", duration: "2-4 hafta" },
      { name: "Dava Açılışı", duration: "1-2 hafta" },
      { name: "Keşif / Bilirkişi", duration: "2-4 ay" },
      { name: "Tahkikat & Karar", duration: "2-6 ay" },
      { name: "İstinaf", duration: "3-6 ay" },
      { name: "Temyiz", duration: "6-12 ay" },
    ],
  },
  miras_hukuku: {
    minDays: 300,
    maxDays: 1080,
    avgDays: 600,
    phases: [
      { name: "Dava Açılışı", duration: "1-2 hafta" },
      { name: "Veraset İlamı / Mirasçı Tespiti", duration: "1-3 ay" },
      { name: "Bilirkişi & Keşif", duration: "3-6 ay" },
      { name: "Tahkikat", duration: "3-12 ay" },
      { name: "Karar", duration: "1-3 ay" },
      { name: "İstinaf & Temyiz", duration: "6-18 ay" },
    ],
  },
  idare_hukuku: {
    minDays: 180,
    maxDays: 720,
    avgDays: 365,
    phases: [
      { name: "İdareye Başvuru", duration: "30-60 gün" },
      { name: "Dava Açılışı (İdare Mahkemesi)", duration: "1-2 hafta" },
      { name: "Savunma & Ara Kararlar", duration: "2-4 ay" },
      { name: "Bilirkişi (Gerekirse)", duration: "2-4 ay" },
      { name: "Karar", duration: "1-3 ay" },
      { name: "İstinaf (Bölge İdare)", duration: "3-6 ay" },
      { name: "Temyiz (Danıştay)", duration: "6-12 ay" },
    ],
  },
  icra_iflas: {
    minDays: 90,
    maxDays: 540,
    avgDays: 270,
    phases: [
      { name: "İcra Takibi Başlatma", duration: "1 gün" },
      { name: "Ödeme/Tahliye Emri Tebliği", duration: "1-3 hafta" },
      { name: "İtiraz Süresi", duration: "7 gün" },
      { name: "İtirazın İptali Davası", duration: "3-12 ay" },
      { name: "Haciz & Satış İşlemleri", duration: "2-6 ay" },
      { name: "İstinaf", duration: "3-6 ay" },
    ],
  },
  diger: {
    minDays: 180,
    maxDays: 720,
    avgDays: 400,
    phases: [
      { name: "Dava Açılışı", duration: "1-2 hafta" },
      { name: "Ön İnceleme", duration: "1-3 ay" },
      { name: "Tahkikat", duration: "3-8 ay" },
      { name: "Karar", duration: "1-3 ay" },
      { name: "Kanun Yolları", duration: "6-18 ay" },
    ],
  },
};

function formatDuration(days: number): string {
  if (days < 30) return `${days} gün`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} ay`;
  }
  const years = Math.floor(days / 365);
  const remainingMonths = Math.round((days % 365) / 30);
  if (remainingMonths === 0) return `${years} yıl`;
  return `${years} yıl ${remainingMonths} ay`;
}

export function estimateCaseDuration(
  category: CaseCategory,
  complexity: "low" | "medium" | "high" = "medium",
  matchedPrecedents?: { case_number: string; court: string; duration_days?: number }[]
): NonNullable<AnalysisResult["estimatedDuration"]> {
  const profile = CATEGORY_DURATIONS[category];

  // Emsal kararlardan gerçek süreleri topla
  const precedentDurations: { case_number: string; court: string; duration_days: number; duration_label: string }[] = [];

  // Yerel veritabanından ilgili süreleri al
  const categoryPrecedents = PRECEDENTS_DB.filter((p) => p.category === category && p.duration_days);
  for (const p of categoryPrecedents) {
    if (p.duration_days) {
      precedentDurations.push({
        case_number: p.case_number,
        court: p.court,
        duration_days: p.duration_days,
        duration_label: formatDuration(p.duration_days),
      });
    }
  }

  // Matched precedent'lardan da ekle
  if (matchedPrecedents) {
    for (const mp of matchedPrecedents) {
      if (mp.duration_days && !precedentDurations.find((pd) => pd.case_number === mp.case_number)) {
        precedentDurations.push({
          case_number: mp.case_number,
          court: mp.court,
          duration_days: mp.duration_days,
          duration_label: formatDuration(mp.duration_days),
        });
      }
    }
  }

  // Karmaşıklığa göre ayarla
  const complexityMultiplier = complexity === "low" ? 0.75 : complexity === "high" ? 1.35 : 1;

  // Emsal sürelerden ortalama hesapla
  let avgDays: number;
  if (precedentDurations.length > 0) {
    const totalDays = precedentDurations.reduce((sum, pd) => sum + pd.duration_days, 0);
    avgDays = Math.round((totalDays / precedentDurations.length) * complexityMultiplier);
  } else {
    avgDays = Math.round(profile.avgDays * complexityMultiplier);
  }

  const minDays = Math.round(profile.minDays * complexityMultiplier);
  const maxDays = Math.round(profile.maxDays * complexityMultiplier);

  const description = `Bu kategorideki davalar ortalama **${formatDuration(avgDays)}** sürmektedir. ` +
    `En kısa ${formatDuration(minDays)}, en uzun ${formatDuration(maxDays)} sürebilir. ` +
    (precedentDurations.length > 0
      ? `Benzer ${precedentDurations.length} emsal karar incelenmiştir.`
      : "Genel istatistikler baz alınmıştır.");

  return {
    minDays,
    maxDays,
    avgDays,
    description,
    phases: profile.phases,
    precedentDurations: precedentDurations.slice(0, 5),
  };
}
