/**
 * Kanun Maddesi Doğrulama Sistemi
 * AI'ın söylediği kanun maddelerini gerçek veritabanıyla doğrular
 */

// Temel kanunların madde sayıları ve kapsamları
const KANUN_MADDE_SAYILARI: Record<string, { min: number; max: number; ad: string }> = {
  "İK": { min: 1, max: 122, ad: "İş Kanunu (4857)" },
  "TBK": { min: 1, max: 649, ad: "Türk Borçlar Kanunu (6098)" },
  "TMK": { min: 1, max: 1030, ad: "Türk Medeni Kanunu (4721)" },
  "TTK": { min: 1, max: 1535, ad: "Türk Ticaret Kanunu (6102)" },
  "TCK": { min: 1, max: 345, ad: "Türk Ceza Kanunu (5237)" },
  "CMK": { min: 1, max: 340, ad: "Ceza Muhakemesi Kanunu (5271)" },
  "HMK": { min: 1, max: 452, ad: "Hukuk Muhakemeleri Kanunu (6100)" },
  "İİK": { min: 1, max: 366, ad: "İcra ve İflas Kanunu (2004)" },
  "TKHK": { min: 1, max: 87, ad: "Tüketicinin Korunması Hakkında Kanun (6502)" },
  "İYUK": { min: 1, max: 62, ad: "İdari Yargılama Usulü Kanunu (2577)" },
  "HUAK": { min: 1, max: 38, ad: "Arabuluculuk Kanunu (6325)" },
  "KVKK": { min: 1, max: 33, ad: "Kişisel Verilerin Korunması Kanunu (6698)" },
  "Anayasa": { min: 1, max: 177, ad: "Türkiye Cumhuriyeti Anayasası (2709)" },
  "AİHS": { min: 1, max: 59, ad: "Avrupa İnsan Hakları Sözleşmesi" },
  "AvK": { min: 1, max: 200, ad: "Avukatlık Kanunu (1136)" },
  "TebK": { min: 1, max: 68, ad: "Tebligat Kanunu (7201)" },
  "HK": { min: 1, max: 138, ad: "Harçlar Kanunu (492)" },
  "KabK": { min: 1, max: 44, ad: "Kabahatler Kanunu (5326)" },
};

// Sık kullanılan kritik madde referansları (doğrulanmış)
const DOGRULANMIS_MADDELER: Record<string, Record<number, string>> = {
  "İK": {
    4: "Tanımlar",
    14: "Çağrı üzerine çalışma",
    17: "Süreli fesih (ihbar tazminatı)",
    18: "Feshin geçerli sebebe dayandırılması",
    19: "Sözleşmenin feshinde usul",
    20: "Fesih bildirimine itiraz ve usulü",
    21: "Geçersiz seçimin sonuçları",
    22: "Çalışma koşullarında değişiklik",
    24: "İşçinin haklı nedenle derhal fesih hakkı",
    25: "İşverenin haklı nedenle derhal fesih hakkı",
    32: "Ücret ve ücretin ödenmesi",
    34: "Ücretin gününde ödenmemesi",
    41: "Fazla çalışma ücreti",
    46: "Hafta tatili ücreti",
    53: "Yıllık ücretli izin hakkı",
    63: "İşçinin haklı nedenle derhal fesih hakkı (kadın işçi)",
    112: "Kıdem tazminatı",
  },
  "TBK": {
    49: "Haksız fiilden doğan borç",
    50: "Zararın ve kusurun ispatı",
    51: "Tazminatın belirlenmesi",
    56: "Manevi tazminat",
    117: "Borçlunun temerrüdü",
    138: "Aşırı ifa güçlüğü",
    146: "On yıllık zamanaşımı",
    147: "Beş yıllık zamanaşımı",
    299: "Kira sözleşmesi tanımı",
    315: "Kira bedeli",
    343: "Bağlantılı sözleşme yasağı",
    344: "Kira bedelinin belirlenmesi",
    347: "Konut ve çatılı kira - bildirim",
    350: "Kiraya verenin gereksinimi",
    352: "Kiracıdan kaynaklanan tahliye",
    354: "Dava sebeplerinin sınırlılığı",
  },
  "TMK": {
    1: "Hukukun uygulanması ve kaynakları",
    2: "Dürüstlük kuralı",
    3: "İyiniyet",
    24: "Kişiliğin korunması",
    125: "Evlenme yaşı",
    161: "Zina sebebiyle boşanma",
    162: "Hayata kast, pek kötü muamele",
    163: "Suç işleme ve haysiyetsiz hayat",
    164: "Terk",
    166: "Evlilik birliğinin sarsılması",
    169: "Boşanmada yargılama usulü",
    174: "Maddi ve manevi tazminat",
    175: "Yoksulluk nafakası",
    176: "Tazminat ve nafakanın ödenme biçimi",
    495: "Yasal mirasçılar",
    505: "Saklı paylı mirasçılar",
    506: "Saklı pay oranları",
    557: "Ölüme bağlı tasarrufların iptali",
  },
  "TKHK": {
    8: "Ayıplı mal",
    11: "Tüketicinin seçimlik hakları",
    14: "Tüketicinin bilgilendirilmesi",
    47: "Mesafeli sözleşmeler",
    48: "Cayma hakkı",
    68: "Tüketici hakem heyetleri",
    73: "Tüketici mahkemeleri",
  },
  "TCK": {
    21: "Kast",
    22: "Taksir",
    25: "Meşru savunma ve zorunluluk hali",
    29: "Haksız tahrik",
    50: "Kısa süreli hapis cezasına seçenek",
    51: "Hapis cezasının ertelenmesi",
    81: "Kasten öldürme",
    86: "Kasten yaralama",
    106: "Tehdit",
    125: "Hakaret",
    141: "Hırsızlık",
    155: "Güveni kötüye kullanma",
    157: "Dolandırıcılık",
  },
  "Anayasa": {
    10: "Kanun önünde eşitlik",
    12: "Temel hak ve hürriyetler",
    13: "Temel hak ve hürriyetlerin sınırlanması",
    17: "Kişinin dokunulmazlığı",
    19: "Kişi hürriyeti ve güvenliği",
    20: "Özel hayatın gizliliği",
    25: "Düşünce ve kanaat hürriyeti",
    26: "Düşünceyi açıklama",
    35: "Mülkiyet hakkı",
    36: "Hak arama hürriyeti",
    37: "Kanuni hâkim güvencesi",
    38: "Suç ve cezalara ilişkin esaslar",
    48: "Çalışma ve sözleşme hürriyeti",
    49: "Çalışma hakkı ve ödevi",
    50: "Çalışma şartları ve dinlenme hakkı",
    51: "Sendika kurma hakkı",
    55: "Ücrette adalet sağlanması",
    56: "Sağlık hizmetleri",
    57: "Konut hakkı",
  },
};

export interface CitationValidation {
  original: string;
  kanun: string;
  madde: number;
  valid: boolean;
  description?: string;
  fullName?: string;
  confidence: "high" | "medium" | "low";
}

/**
 * AI yanıtındaki kanun maddesi atıflarını doğrula
 */
export function validateCitations(text: string): CitationValidation[] {
  const citations: CitationValidation[] = [];

  // Pattern: "İK md. 17", "TBK md. 347", "Anayasa md. 36" vb.
  const pattern = /\b(İK|TBK|TMK|TTK|TCK|CMK|HMK|İİK|TKHK|İYUK|HUAK|KVKK|Anayasa|AİHS|AvK|TebK|HK|KabK)\s*(?:md\.|m\.|madde)\s*(\d+)/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const kanun = match[1].toUpperCase() === "AIHS" ? "AİHS" : match[1];
    const madde = parseInt(match[2]);
    const kanunInfo = KANUN_MADDE_SAYILARI[kanun];

    if (!kanunInfo) {
      citations.push({
        original: match[0],
        kanun,
        madde,
        valid: false,
        confidence: "low",
      });
      continue;
    }

    const inRange = madde >= kanunInfo.min && madde <= kanunInfo.max;
    const dogrulanmis = DOGRULANMIS_MADDELER[kanun]?.[madde];

    citations.push({
      original: match[0],
      kanun,
      madde,
      valid: inRange,
      description: dogrulanmis || undefined,
      fullName: kanunInfo.ad,
      confidence: dogrulanmis ? "high" : inRange ? "medium" : "low",
    });
  }

  return citations;
}

/**
 * Güven skoru hesapla
 */
export function calculateConfidenceScore(citations: CitationValidation[]): {
  score: number;
  label: "Yüksek" | "Orta" | "Düşük";
  color: string;
} {
  if (citations.length === 0) {
    return { score: 50, label: "Orta", color: "text-amber-600" };
  }

  const validCount = citations.filter((c) => c.valid).length;
  const highConfCount = citations.filter((c) => c.confidence === "high").length;
  const ratio = validCount / citations.length;

  let score = Math.round(ratio * 100);
  if (highConfCount > 0) score = Math.min(100, score + highConfCount * 5);

  if (score >= 80) return { score, label: "Yüksek", color: "text-emerald-600" };
  if (score >= 50) return { score, label: "Orta", color: "text-amber-600" };
  return { score, label: "Düşük", color: "text-red-600" };
}

/**
 * Atıf bilgilerini zenginleştir (tooltip için)
 */
export function enrichCitation(kanun: string, madde: number): string | null {
  return DOGRULANMIS_MADDELER[kanun]?.[madde] || null;
}
