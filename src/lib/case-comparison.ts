"use client";

/**
 * Dava Aç vs Açma - Maliyet ve Risk Karşılaştırma Raporu
 */

export interface ComparisonResult {
  davaMaliyeti: {
    harclar: number;
    avukatUcreti: number;
    bilirkisi: number;
    tebligat: number;
    diger: number;
    toplam: number;
  };
  arabuluculukMaliyeti: {
    ucret: number;
    toplam: number;
  };
  tahminiSure: {
    davaAy: number;
    arabuluculukHafta: number;
  };
  kazanmaRiski: {
    oran: number;
    label: string;
  };
  tavsiye: "dava_ac" | "arabuluculuk" | "uzlasma" | "vazgec";
  tavsiyeAciklama: string;
  karsilastirma: { label: string; dava: string; arabuluculuk: string }[];
}

export function generateComparison(
  category: string,
  davaKonusuDeger: number,
  winProbability: number
): ComparisonResult {
  // Harç hesaplama
  const nispiOran = 0.06831;
  const maktuHarc = 677.6; // 2026
  const harclar = davaKonusuDeger > 0
    ? maktuHarc + (davaKonusuDeger * nispiOran)
    : maktuHarc * 2;

  // Avukat ücreti tahmini (AAÜT 2026 tahmini)
  const avukatUcretiMin: Record<string, number> = {
    is_hukuku: 17000,
    aile_hukuku: 25000,
    ticaret_hukuku: 30000,
    ceza_hukuku: 20000,
    tuketici_hukuku: 10000,
    kira_hukuku: 15000,
    miras_hukuku: 25000,
    idare_hukuku: 18000,
    icra_iflas: 12000,
    diger: 15000,
  };

  const avukatUcreti = avukatUcretiMin[category] || 15000;
  const bilirkisi = category === "ticaret_hukuku" ? 5000 : category === "is_hukuku" ? 3000 : 2000;
  const tebligat = 500;

  const davaToplam = harclar + avukatUcreti + bilirkisi + tebligat;

  // Arabuluculuk maliyeti
  const arabuluculukUcret = davaKonusuDeger > 0
    ? Math.max(2000, davaKonusuDeger * 0.03)
    : 3000;

  // Süre tahmini (ay)
  const sureTahmini: Record<string, number> = {
    is_hukuku: 12,
    aile_hukuku: 18,
    ticaret_hukuku: 24,
    ceza_hukuku: 15,
    tuketici_hukuku: 8,
    kira_hukuku: 10,
    miras_hukuku: 24,
    idare_hukuku: 18,
    icra_iflas: 6,
    diger: 12,
  };

  const davaAy = sureTahmini[category] || 12;

  // Tavsiye
  let tavsiye: ComparisonResult["tavsiye"];
  let tavsiyeAciklama: string;

  if (winProbability >= 70 && davaKonusuDeger > davaToplam * 2) {
    tavsiye = "dava_ac";
    tavsiyeAciklama = "Kazanma ihtimaliniz yüksek ve dava konusu değer masrafları karşılıyor. Dava açmanız mantıklı.";
  } else if (winProbability >= 40) {
    tavsiye = "arabuluculuk";
    tavsiyeAciklama = "Arabuluculuk hem daha hızlı hem daha ekonomik. Önce arabuluculuğu deneyin.";
  } else if (winProbability >= 25) {
    tavsiye = "uzlasma";
    tavsiyeAciklama = "Kazanma ihtimaliniz düşük. Karşı tarafla uzlaşma yolunu deneyin.";
  } else {
    tavsiye = "vazgec";
    tavsiyeAciklama = "Kazanma ihtimaliniz çok düşük ve maliyet yüksek. Dava açmanız önerilmez.";
  }

  return {
    davaMaliyeti: {
      harclar: Math.round(harclar),
      avukatUcreti,
      bilirkisi,
      tebligat,
      diger: 500,
      toplam: Math.round(davaToplam + 500),
    },
    arabuluculukMaliyeti: {
      ucret: Math.round(arabuluculukUcret),
      toplam: Math.round(arabuluculukUcret),
    },
    tahminiSure: {
      davaAy,
      arabuluculukHafta: 4,
    },
    kazanmaRiski: {
      oran: winProbability,
      label: winProbability >= 65 ? "Yüksek" : winProbability >= 40 ? "Orta" : "Düşük",
    },
    tavsiye,
    tavsiyeAciklama,
    karsilastirma: [
      { label: "Toplam Maliyet", dava: `₺${(davaToplam + 500).toLocaleString("tr-TR")}`, arabuluculuk: `₺${Math.round(arabuluculukUcret).toLocaleString("tr-TR")}` },
      { label: "Tahmini Süre", dava: `${davaAy} ay`, arabuluculuk: "4 hafta" },
      { label: "Başarı Oranı", dava: `%${winProbability}`, arabuluculuk: "%60-75" },
      { label: "Stres Seviyesi", dava: "Yüksek", arabuluculuk: "Düşük" },
      { label: "Gizlilik", dava: "Kamuya açık", arabuluculuk: "Gizli" },
    ],
  };
}
