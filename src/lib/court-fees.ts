import type { CaseCategory } from "@/types/database";

export type FeeType =
  | "basvurma_harci"
  | "karar_ilam_harci"
  | "vekalet_harci"
  | "temyiz_harci"
  | "istinaf_harci"
  | "icra_harci"
  | "diger";

export interface CourtFee {
  name: string;
  amount: number;
  description: string;
  type: FeeType;
}

export interface FeeCalculation {
  fees: CourtFee[];
  totalAmount: number;
  davaKonusuDeger: number;
  category: string;
  notes: string[];
}

// 2024-2025 Maktu Harç Tutarları (492 sayılı Harçlar Kanunu)
const BASVURMA_HARCI_MAKTU = 427.6; // 2025 yılı
const KARAR_ILAM_HARCI_MAKTU = 427.6; // Maktu karar harcı (nispi hesaplanamadığında)
const VEKALET_HARCI = 70.1; // 2025 yılı vekâletname sureti harcı
const TEMYIZ_HARCI_MAKTU = 1312.0; // 2025 yılı temyiz başvurma harcı
const ISTINAF_HARCI_MAKTU = 1312.0; // 2025 yılı istinaf başvurma harcı
const NISPI_KARAR_ILAM_ORANI = 0.06831; // %6.831 nispi karar ve ilam harcı (binde 68.31)
const NISPI_KARAR_ILAM_MIN = 427.6; // Nispi harcın alt sınırı
const ICRA_BASVURMA_HARCI = 427.6;
const ICRA_TAHSIL_HARCI_ORANI = 0.0227; // %2.27 (binde 22.7) peşin tahsil harcı
const TUKETICI_MUAF_SINIR = 66_000; // 2025 yılı tüketici hakem heyeti üst sınırı (yaklaşık)

/**
 * Türk mahkeme harçlarını hesaplar.
 * 492 sayılı Harçlar Kanunu ve 2025 yılı harç tarifesine göre.
 */
export function calculateCourtFees(
  category: string,
  davaKonusuDeger: number,
  isTemyiz?: boolean
): FeeCalculation {
  const fees: CourtFee[] = [];
  const notes: string[] = [];

  const cat = category as CaseCategory;

  // --- İş Hukuku: İşçi lehine muafiyetler ---
  if (cat === "is_hukuku") {
    notes.push(
      "7036 sayılı İş Mahkemeleri Kanunu m.12: Davacı işçiler yargılama harçlarından muaftır. Harçlar davalı tarafa yükletilir."
    );
    notes.push(
      "İşçi sıfatıyla dava açıyorsanız başvurma harcı ve karar harcı ödemeniz gerekmez (peşin harç alınmaz)."
    );
    notes.push(
      "İş davalarında zorunlu arabuluculuk aşaması tamamlanmadan dava açılamaz (7036 s.K. m.3)."
    );

    // İşçi muafiyeti: harç yok ama bilgi amaçlı göster
    fees.push({
      name: "Başvurma Harcı",
      amount: 0,
      description: "İşçi muafiyeti nedeniyle tahsil edilmez",
      type: "basvurma_harci",
    });

    if (davaKonusuDeger > 0) {
      fees.push({
        name: "Karar ve İlam Harcı (Nispi)",
        amount: 0,
        description: `Dava sonunda karşı tarafa yükletilir (%6.831 = ${formatCurrency(davaKonusuDeger * NISPI_KARAR_ILAM_ORANI)})`,
        type: "karar_ilam_harci",
      });
    }

    fees.push({
      name: "Vekâletname Harcı",
      amount: VEKALET_HARCI,
      description: "Avukat ile temsil ediliyorsanız",
      type: "vekalet_harci",
    });

    if (isTemyiz) {
      fees.push({
        name: "Temyiz/İstinaf Başvurma Harcı",
        amount: 0,
        description: "İşçi muafiyeti kapsamında",
        type: "temyiz_harci",
      });
    }

    const total = fees.reduce((s, f) => s + f.amount, 0);
    return { fees, totalAmount: total, davaKonusuDeger, category, notes };
  }

  // --- Tüketici Hukuku ---
  if (cat === "tuketici_hukuku") {
    if (davaKonusuDeger > 0 && davaKonusuDeger <= TUKETICI_MUAF_SINIR) {
      notes.push(
        `6502 sayılı TKHK m.73/2: Değeri ${formatCurrency(TUKETICI_MUAF_SINIR)} TL altındaki uyuşmazlıklar için Tüketici Hakem Heyetine başvuru zorunludur ve ücretsizdir.`
      );
      notes.push(
        "Hakem heyeti kararına itiraz halinde tüketici mahkemesine başvurabilirsiniz. Tüketici davaları harçtan muaftır."
      );

      fees.push({
        name: "Başvurma Harcı",
        amount: 0,
        description: "Tüketici davalarında harç muafiyeti",
        type: "basvurma_harci",
      });
      fees.push({
        name: "Karar ve İlam Harcı",
        amount: 0,
        description: "Tüketici davalarında muaf",
        type: "karar_ilam_harci",
      });

      const total = fees.reduce((s, f) => s + f.amount, 0);
      return { fees, totalAmount: total, davaKonusuDeger, category, notes };
    }

    notes.push(
      "6502 sayılı Tüketici Koruma Kanunu: Tüketici mahkemelerinde açılan davalar harçtan muaftır."
    );

    fees.push({
      name: "Başvurma Harcı",
      amount: 0,
      description: "Tüketici davaları harçtan muaftır",
      type: "basvurma_harci",
    });
    fees.push({
      name: "Karar ve İlam Harcı",
      amount: 0,
      description: "Tüketici davaları harçtan muaftır",
      type: "karar_ilam_harci",
    });
    fees.push({
      name: "Vekâletname Harcı",
      amount: VEKALET_HARCI,
      description: "Avukat ile temsil ediliyorsanız",
      type: "vekalet_harci",
    });

    if (isTemyiz) {
      notes.push("Temyiz/İstinaf aşamasında harç muafiyeti devam eder.");
      fees.push({
        name: "Temyiz/İstinaf Harcı",
        amount: 0,
        description: "Tüketici muafiyeti kapsamında",
        type: "temyiz_harci",
      });
    }

    const total = fees.reduce((s, f) => s + f.amount, 0);
    return { fees, totalAmount: total, davaKonusuDeger, category, notes };
  }

  // --- Ceza Hukuku ---
  if (cat === "ceza_hukuku") {
    notes.push(
      "Ceza davalarında kamu davası re'sen açılır; müşteki/mağdur harç ödemez."
    );
    notes.push(
      "Şikâyete bağlı suçlarda Cumhuriyet Başsavcılığına şikâyet ücretsizdir."
    );
    notes.push(
      "Katılma (müdahale) talebi için harç gerekmez."
    );

    fees.push({
      name: "Ceza Davası Harcı",
      amount: 0,
      description: "Ceza davalarında müşteki harç ödemez",
      type: "basvurma_harci",
    });

    const total = 0;
    return { fees, totalAmount: total, davaKonusuDeger, category, notes };
  }

  // --- İdare Hukuku ---
  if (cat === "idare_hukuku") {
    notes.push(
      "2577 sayılı İYUK kapsamında idari dava harçları maktu olarak alınır."
    );
    notes.push(
      "İptal davalarında nispi harç alınmaz; tam yargı davalarında dava değeri üzerinden nispi harç hesaplanır."
    );

    fees.push({
      name: "Başvurma Harcı (İdare Mahkemesi)",
      amount: BASVURMA_HARCI_MAKTU,
      description: "2025 yılı maktu başvurma harcı",
      type: "basvurma_harci",
    });

    if (davaKonusuDeger > 0) {
      // Tam yargı davası - nispi harç
      const nispiHarc = Math.max(
        davaKonusuDeger * NISPI_KARAR_ILAM_ORANI,
        NISPI_KARAR_ILAM_MIN
      );
      const pesinHarc = nispiHarc / 4; // Peşin alınan 1/4'ü
      fees.push({
        name: "Peşin Karar ve İlam Harcı (1/4)",
        amount: Math.round(pesinHarc * 100) / 100,
        description: `Tam yargı davası - Toplam nispi: ${formatCurrency(nispiHarc)} TL'nin 1/4'ü peşin alınır`,
        type: "karar_ilam_harci",
      });
      notes.push(
        "Tam yargı davalarında nispi karar harcının 1/4'ü dava açılırken peşin alınır, kalan 3/4'ü karar aşamasında tahsil edilir."
      );
    } else {
      fees.push({
        name: "Karar ve İlam Harcı (Maktu)",
        amount: KARAR_ILAM_HARCI_MAKTU,
        description: "İptal davalarında maktu harç",
        type: "karar_ilam_harci",
      });
    }

    fees.push({
      name: "Vekâletname Harcı",
      amount: VEKALET_HARCI,
      description: "Avukat ile temsil ediliyorsanız",
      type: "vekalet_harci",
    });

    if (isTemyiz) {
      fees.push({
        name: "İstinaf Başvurma Harcı",
        amount: ISTINAF_HARCI_MAKTU,
        description: "Bölge idare mahkemesine istinaf",
        type: "istinaf_harci",
      });
    }

    const total = fees.reduce((s, f) => s + f.amount, 0);
    return { fees, totalAmount: total, davaKonusuDeger, category, notes };
  }

  // --- İcra İflas ---
  if (cat === "icra_iflas") {
    notes.push(
      "İcra takibinde başvurma harcı ve peşin tahsil harcı alınır."
    );

    fees.push({
      name: "İcra Başvurma Harcı",
      amount: ICRA_BASVURMA_HARCI,
      description: "2025 yılı icra başvurma harcı",
      type: "icra_harci",
    });

    if (davaKonusuDeger > 0) {
      const tahsilHarci = Math.max(
        davaKonusuDeger * ICRA_TAHSIL_HARCI_ORANI,
        NISPI_KARAR_ILAM_MIN
      );
      fees.push({
        name: "Peşin Tahsil Harcı",
        amount: Math.round(tahsilHarci * 100) / 100,
        description: `Takip tutarının %2.27'si (binde 22.7)`,
        type: "icra_harci",
      });
      notes.push(
        "Tahsil harcının tamamı borçludan tahsil edilir. Peşin alınan kısım mahsup edilir."
      );
    }

    fees.push({
      name: "Vekâletname Harcı",
      amount: VEKALET_HARCI,
      description: "Avukat ile temsil ediliyorsanız",
      type: "vekalet_harci",
    });

    const total = fees.reduce((s, f) => s + f.amount, 0);
    return { fees, totalAmount: total, davaKonusuDeger, category, notes };
  }

  // --- Genel Hukuk Davaları (Aile, Ticaret, Kira, Miras, Diğer) ---

  // Başvurma harcı
  fees.push({
    name: "Başvurma Harcı",
    amount: BASVURMA_HARCI_MAKTU,
    description: "2025 yılı maktu başvurma harcı",
    type: "basvurma_harci",
  });

  // Karar ve ilam harcı
  if (davaKonusuDeger > 0) {
    const nispiHarc = Math.max(
      davaKonusuDeger * NISPI_KARAR_ILAM_ORANI,
      NISPI_KARAR_ILAM_MIN
    );
    const pesinHarc = nispiHarc / 4;
    fees.push({
      name: "Peşin Karar ve İlam Harcı (1/4)",
      amount: Math.round(pesinHarc * 100) / 100,
      description: `Nispi harcın (%6.831) 1/4'ü peşin alınır. Toplam: ${formatCurrency(nispiHarc)} TL`,
      type: "karar_ilam_harci",
    });
    notes.push(
      "Nispi karar ve ilam harcının 1/4'ü dava açarken peşin alınır, kalan 3/4'ü karar sonrasında tahsil edilir."
    );
  } else {
    fees.push({
      name: "Karar ve İlam Harcı (Maktu)",
      amount: KARAR_ILAM_HARCI_MAKTU,
      description: "Konusu belli bir değere bağlı olmayan davalarda maktu harç",
      type: "karar_ilam_harci",
    });
  }

  // Vekâletname harcı
  fees.push({
    name: "Vekâletname Harcı",
    amount: VEKALET_HARCI,
    description: "Avukat ile temsil ediliyorsanız",
    type: "vekalet_harci",
  });

  // Temyiz/İstinaf harcı
  if (isTemyiz) {
    fees.push({
      name: "İstinaf Başvurma Harcı",
      amount: ISTINAF_HARCI_MAKTU,
      description: "Bölge adliye mahkemesine istinaf başvurusu",
      type: "istinaf_harci",
    });
    fees.push({
      name: "Temyiz Başvurma Harcı",
      amount: TEMYIZ_HARCI_MAKTU,
      description: "Yargıtay'a temyiz başvurusu",
      type: "temyiz_harci",
    });
    notes.push(
      "İstinaf ve temyiz harçları ayrı ayrı alınır. Önce istinaf, ardından temyiz yoluna başvurulabilir."
    );
  }

  // Kategori özel notları
  if (cat === "aile_hukuku") {
    notes.push(
      "Boşanma davaları maktu harca tabidir. Nafaka ve tazminat talepleri nispi harca tabidir."
    );
    notes.push(
      "Adli yardım talebiyle harçlardan muafiyet sağlanabilir (HMK m.334-340)."
    );
  }

  if (cat === "ticaret_hukuku") {
    notes.push(
      "Ticaret davalarında zorunlu arabuluculuk (TTK m.5/A) dava şartıdır. Arabuluculuk ücreti ayrıca ödenir."
    );
    notes.push(
      "6102 sayılı TTK kapsamındaki ticari davalarda nispi harç uygulanır."
    );
  }

  if (cat === "kira_hukuku") {
    notes.push(
      "Kira davalarında yıllık kira bedeli üzerinden nispi harç hesaplanır."
    );
    notes.push(
      "Tahliye davaları için maktu harç alınabilir; kira alacağı ile birlikte açılırsa nispi harç uygulanır."
    );
  }

  if (cat === "miras_hukuku") {
    notes.push(
      "Miras taksim davalarında miras payı değeri üzerinden nispi harç alınır."
    );
    notes.push(
      "Vasiyetname iptali davaları maktu harca tabidir."
    );
  }

  notes.push(
    "Yukarıdaki tutarlar 2025 yılı harç tarifesine göre hesaplanmış olup bilgi amaçlıdır. Kesin tutarlar için adliye veznesine danışınız."
  );

  const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);

  return {
    fees,
    totalAmount,
    davaKonusuDeger,
    category,
    notes,
  };
}

function formatCurrency(value: number): string {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export { formatCurrency };
