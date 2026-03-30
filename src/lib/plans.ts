export interface PaymentPlan {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  period: "monthly" | "yearly";
  features: string[];
  popular?: boolean;
  analysisLimit: number;
}

export const PLANS: PaymentPlan[] = [
  {
    id: "free",
    name: "Ücretsiz",
    price: "0 ₺",
    priceValue: 0,
    period: "monthly",
    features: [
      "3 dava analizi",
      "Temel emsal karşılaştırma",
      "Zamanaşımı hesaplayıcı",
      "Arabuluculuk hesaplayıcı",
    ],
    analysisLimit: 3,
  },
  {
    id: "pro_monthly",
    name: "Pro",
    price: "99 ₺/ay",
    priceValue: 99,
    period: "monthly",
    popular: true,
    features: [
      "Sınırsız dava analizi",
      "Claude AI destekli analiz",
      "Detaylı emsal karşılaştırma",
      "PDF avukat dosyası indirme",
      "Tahmini dava süresi",
      "Öncelikli avukat eşleştirme",
      "Tüm araçlar",
    ],
    analysisLimit: -1,
  },
  {
    id: "pro_yearly",
    name: "Pro Yıllık",
    price: "799 ₺/yıl",
    priceValue: 799,
    period: "yearly",
    features: [
      "Pro planın tüm özellikleri",
      "Yıllık %33 indirim",
      "Öncelikli destek",
    ],
    analysisLimit: -1,
  },
  {
    id: "lawyer_monthly",
    name: "Avukat Pro",
    price: "299 ₺/ay",
    priceValue: 299,
    period: "monthly",
    features: [
      "Profil öne çıkarma",
      "Müvekkil talep bildirimleri",
      "Üst sırada listeleme",
      "Profil rozeti (Doğrulanmış)",
      "Detaylı istatistikler",
    ],
    analysisLimit: -1,
  },
];

export function getPlanById(planId: string): PaymentPlan | undefined {
  return PLANS.find((p) => p.id === planId);
}
