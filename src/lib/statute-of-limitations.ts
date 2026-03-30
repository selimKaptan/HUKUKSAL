import type { CaseCategory } from "@/types/database";

export interface StatuteInfo {
  category: CaseCategory;
  subcategory: string;
  duration: string;
  durationMonths: number;
  legalBasis: string;
  description: string;
  warnings: string[];
}

export interface StatuteResult {
  statutes: StatuteInfo[];
  eventDate: Date | null;
  deadlines: {
    subcategory: string;
    deadline: string;
    remaining: string;
    isExpired: boolean;
    isUrgent: boolean; // 3 aydan az kaldıysa
    daysRemaining: number;
  }[];
}

const STATUTE_DATABASE: StatuteInfo[] = [
  // İŞ HUKUKU
  { category: "is_hukuku", subcategory: "Kıdem Tazminatı", duration: "5 yıl", durationMonths: 60, legalBasis: "İş Kanunu m.32, TBK m.146", description: "İş sözleşmesinin sona ermesinden itibaren", warnings: ["İşten ayrılma tarihinden itibaren başlar"] },
  { category: "is_hukuku", subcategory: "İhbar Tazminatı", duration: "5 yıl", durationMonths: 60, legalBasis: "İş Kanunu m.17, TBK m.146", description: "Fesih tarihinden itibaren", warnings: [] },
  { category: "is_hukuku", subcategory: "Fazla Mesai Ücreti", duration: "5 yıl", durationMonths: 60, legalBasis: "İş Kanunu m.41, TBK m.146", description: "Her ay ayrı ayrı muaccel olur", warnings: ["Her ayın zamanaşımı ayrı hesaplanır"] },
  { category: "is_hukuku", subcategory: "İşe İade Davası", duration: "1 ay", durationMonths: 1, legalBasis: "İş Kanunu m.20", description: "Fesih bildiriminin tebliğinden itibaren", warnings: ["Süre çok kısa! Arabuluculuğa hemen başvurun", "Zorunlu arabuluculuk süresi dahildir"] },
  { category: "is_hukuku", subcategory: "Yıllık İzin Ücreti", duration: "5 yıl", durationMonths: 60, legalBasis: "İş Kanunu m.59", description: "İş sözleşmesinin sona ermesinden itibaren", warnings: [] },

  // AİLE HUKUKU
  { category: "aile_hukuku", subcategory: "Boşanma Davası", duration: "Süresiz", durationMonths: 9999, legalBasis: "TMK m.161-166", description: "Zamanaşımı yoktur, hak düşürücü süreler vardır", warnings: ["Affetme halinde dava hakkı düşer"] },
  { category: "aile_hukuku", subcategory: "Maddi Tazminat (Boşanma)", duration: "1 yıl", durationMonths: 12, legalBasis: "TMK m.178", description: "Boşanma kararının kesinleşmesinden itibaren", warnings: ["Boşanma davası ile birlikte açılabilir"] },
  { category: "aile_hukuku", subcategory: "Nafaka Artırım", duration: "Süresiz", durationMonths: 9999, legalBasis: "TMK m.176", description: "Koşullar değiştiğinde her zaman istenebilir", warnings: [] },
  { category: "aile_hukuku", subcategory: "Velayet Değişikliği", duration: "Süresiz", durationMonths: 9999, legalBasis: "TMK m.183", description: "Koşullar değiştiğinde her zaman istenebilir", warnings: ["Çocuğun üstün yararı esastır"] },

  // TÜKETİCİ HUKUKU
  { category: "tuketici_hukuku", subcategory: "Ayıplı Mal (Açık Ayıp)", duration: "6 ay", durationMonths: 6, legalBasis: "TKHK m.12", description: "Malın tesliminden itibaren", warnings: ["30 gün içinde satıcıya bildirmelisiniz"] },
  { category: "tuketici_hukuku", subcategory: "Ayıplı Mal (Gizli Ayıp)", duration: "2 yıl", durationMonths: 24, legalBasis: "TKHK m.12", description: "Malın tesliminden itibaren", warnings: ["Ayıp fark edildiğinde derhal bildirilmelidir"] },
  { category: "tuketici_hukuku", subcategory: "Cayma Hakkı", duration: "14 gün", durationMonths: 0.5, legalBasis: "TKHK m.43", description: "Malın teslimine veya sözleşme tarihinden itibaren", warnings: ["Mesafeli satışlarda geçerlidir", "Süre çok kısa!"] },

  // KİRA HUKUKU
  { category: "kira_hukuku", subcategory: "Kira Alacağı", duration: "5 yıl", durationMonths: 60, legalBasis: "TBK m.147", description: "Her kira döneminden itibaren ayrı ayrı", warnings: [] },
  { category: "kira_hukuku", subcategory: "Tahliye (İhtiyaç)", duration: "1 ay", durationMonths: 1, legalBasis: "TBK m.350", description: "Kira süresinin bitiminden itibaren", warnings: ["Kira bitiş tarihinden itibaren 1 ay içinde açılmalı"] },
  { category: "kira_hukuku", subcategory: "Kira Tespit", duration: "Her zaman", durationMonths: 9999, legalBasis: "TBK m.344", description: "Yeni kira dönemi başlamadan 30 gün önce", warnings: ["İhtar çekilmesi önemlidir"] },

  // CEZA HUKUKU
  { category: "ceza_hukuku", subcategory: "Şikayet (Takibi Şikayete Bağlı)", duration: "6 ay", durationMonths: 6, legalBasis: "TCK m.73", description: "Fiili ve faili öğrenme tarihinden itibaren", warnings: ["Süre çok kısa! Hemen şikayette bulunun"] },
  { category: "ceza_hukuku", subcategory: "Hakaret", duration: "6 ay", durationMonths: 6, legalBasis: "TCK m.73, m.125", description: "Fiili ve faili öğrenme tarihinden itibaren", warnings: ["Şikayete bağlı suçtur"] },
  { category: "ceza_hukuku", subcategory: "Dolandırıcılık", duration: "8 yıl", durationMonths: 96, legalBasis: "TCK m.66", description: "Suç tarihinden itibaren", warnings: ["Re'sen soruşturulur, şikayet gerekmez"] },

  // TİCARET HUKUKU
  { category: "ticaret_hukuku", subcategory: "Haksız Rekabet", duration: "1 yıl", durationMonths: 12, legalBasis: "TTK m.56", description: "Fiilin öğrenilmesinden itibaren (her halde 3 yıl)", warnings: [] },
  { category: "ticaret_hukuku", subcategory: "Çek Alacağı", duration: "3 yıl", durationMonths: 36, legalBasis: "TTK m.814", description: "İbraz süresinin bitiminden itibaren", warnings: [] },

  // MİRAS HUKUKU
  { category: "miras_hukuku", subcategory: "Tenkis Davası", duration: "10 yıl", durationMonths: 120, legalBasis: "TMK m.571", description: "Mirasın açılmasından itibaren (öğrenmeden: 1 yıl)", warnings: ["1 yıllık hak düşürücü süre de vardır"] },
  { category: "miras_hukuku", subcategory: "Mirasın Reddi", duration: "3 ay", durationMonths: 3, legalBasis: "TMK m.606", description: "Ölümü öğrenme tarihinden itibaren", warnings: ["Süre çok kısa! Hemen başvurun", "Sulh hukuk mahkemesine başvurulur"] },

  // İDARE HUKUKU
  { category: "idare_hukuku", subcategory: "İptal Davası", duration: "60 gün", durationMonths: 2, legalBasis: "İYUK m.7", description: "İdari işlemin tebliğinden itibaren", warnings: ["Süre kısadır, hemen harekete geçin"] },
  { category: "idare_hukuku", subcategory: "Tam Yargı Davası", duration: "1 yıl", durationMonths: 12, legalBasis: "İYUK m.13", description: "Zararın öğrenilmesinden itibaren", warnings: ["İdareye başvuru zorunludur"] },

  // İCRA İFLAS
  { category: "icra_iflas", subcategory: "İtirazın İptali", duration: "1 yıl", durationMonths: 12, legalBasis: "İİK m.67", description: "İtirazın tebliğinden itibaren", warnings: [] },
  { category: "icra_iflas", subcategory: "Menfi Tespit", duration: "Süresiz", durationMonths: 9999, legalBasis: "İİK m.72", description: "Borcun ödenmesine kadar", warnings: ["Ödeme yapıldıysa istirdat davasına dönüşür"] },
];

export function getStatuteOfLimitations(
  category: CaseCategory,
  eventDate?: string
): StatuteResult {
  const statutes = STATUTE_DATABASE.filter((s) => s.category === category);
  const parsedDate = eventDate ? new Date(eventDate) : null;

  const deadlines = statutes.map((s) => {
    if (!parsedDate || s.durationMonths >= 9999) {
      return {
        subcategory: s.subcategory,
        deadline: s.durationMonths >= 9999 ? "Zamanaşımı yok" : "Olay tarihi gerekli",
        remaining: s.durationMonths >= 9999 ? "Süresiz" : "Hesaplanamadı",
        isExpired: false,
        isUrgent: false,
        daysRemaining: s.durationMonths >= 9999 ? 99999 : -1,
      };
    }

    const deadlineDate = new Date(parsedDate);
    deadlineDate.setMonth(deadlineDate.getMonth() + s.durationMonths);

    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining < 0;
    const isUrgent = daysRemaining >= 0 && daysRemaining <= 90;

    let remaining: string;
    if (isExpired) {
      remaining = `${Math.abs(daysRemaining)} gün önce doldu!`;
    } else if (daysRemaining <= 30) {
      remaining = `${daysRemaining} gün kaldı!`;
    } else if (daysRemaining <= 365) {
      remaining = `${Math.ceil(daysRemaining / 30)} ay kaldı`;
    } else {
      remaining = `${Math.floor(daysRemaining / 365)} yıl ${Math.ceil((daysRemaining % 365) / 30)} ay kaldı`;
    }

    return {
      subcategory: s.subcategory,
      deadline: deadlineDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
      remaining,
      isExpired,
      isUrgent,
      daysRemaining,
    };
  });

  return { statutes, eventDate: parsedDate, deadlines };
}
