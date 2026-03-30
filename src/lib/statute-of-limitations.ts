import type { CaseCategory } from "@/types/database";

export interface StatuteInfo {
  category: CaseCategory;
  subcategory: string;
  duration: string;
  durationMonths: number;
  legalBasis: string;
  description: string;
  warnings: string[];
  plainExplanation: string; // Hukuk bilmeyenler için sade açıklama
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
  { category: "is_hukuku", subcategory: "Kıdem Tazminatı", duration: "5 yıl", durationMonths: 60, legalBasis: "İş Kanunu m.32, TBK m.146", description: "İş sözleşmesinin sona ermesinden itibaren", warnings: ["İşten ayrılma tarihinden itibaren başlar"], plainExplanation: "İşten ayrıldığınızda işvereninizin size ödemesi gereken tazminattır. Her çalıştığınız yıl için yaklaşık 1 aylık maaşınız kadar ödeme alma hakkınız var. 5 yıl içinde talep etmezseniz bu hakkınızı kaybedersiniz." },
  { category: "is_hukuku", subcategory: "İhbar Tazminatı", duration: "5 yıl", durationMonths: 60, legalBasis: "İş Kanunu m.17, TBK m.146", description: "Fesih tarihinden itibaren", warnings: [], plainExplanation: "İşvereniniz sizi önceden haber vermeden (ihbar süresi tanımadan) işten çıkardıysa, size ihbar tazminatı ödemek zorundadır. Çalışma sürenize göre 2 ila 8 haftalık maaşınız kadar olabilir." },
  { category: "is_hukuku", subcategory: "Fazla Mesai Ücreti", duration: "5 yıl", durationMonths: 60, legalBasis: "İş Kanunu m.41, TBK m.146", description: "Her ay ayrı ayrı muaccel olur", warnings: ["Her ayın zamanaşımı ayrı hesaplanır"], plainExplanation: "Haftada 45 saatten fazla çalıştıysanız, fazladan çalıştığınız her saat için normal ücretinizin %50 fazlasını alma hakkınız var. Son 5 yılın fazla mesaisini talep edebilirsiniz." },
  { category: "is_hukuku", subcategory: "İşe İade Davası", duration: "1 ay", durationMonths: 1, legalBasis: "İş Kanunu m.20", description: "Fesih bildiriminin tebliğinden itibaren", warnings: ["Süre çok kısa! Arabuluculuğa hemen başvurun", "Zorunlu arabuluculuk süresi dahildir"], plainExplanation: "Haksız yere işten çıkarıldıysanız, işinize geri dönmek için açabileceğiniz davadır. DİKKAT: İşten çıkarıldıktan sonra sadece 1 AY içinde arabulucuya başvurmanız gerekir! Bu süreyi kaçırırsanız dava açamazsınız." },
  { category: "is_hukuku", subcategory: "Yıllık İzin Ücreti", duration: "5 yıl", durationMonths: 60, legalBasis: "İş Kanunu m.59", description: "İş sözleşmesinin sona ermesinden itibaren", warnings: [], plainExplanation: "İşten ayrıldığınızda kullanmadığınız yıllık izin günlerinizin parasını alma hakkınız var. İşveren bunu ödemek zorundadır." },

  // AİLE HUKUKU
  { category: "aile_hukuku", subcategory: "Boşanma Davası", duration: "Süresiz", durationMonths: 9999, legalBasis: "TMK m.161-166", description: "Zamanaşımı yoktur, hak düşürücü süreler vardır", warnings: ["Affetme halinde dava hakkı düşer"], plainExplanation: "Eşinizden boşanmak için açtığınız davadır. Zamanaşımı yoktur, istediğiniz zaman açabilirsiniz. Ancak eşinizin kusurunu affettiyseniz, o kusura dayanarak dava açamazsınız." },
  { category: "aile_hukuku", subcategory: "Maddi Tazminat (Boşanma)", duration: "1 yıl", durationMonths: 12, legalBasis: "TMK m.178", description: "Boşanma kararının kesinleşmesinden itibaren", warnings: ["Boşanma davası ile birlikte açılabilir"], plainExplanation: "Boşanmada kusurlu olan eşten maddi tazminat isteme hakkınız var. Boşanma kesinleştikten sonra 1 yıl içinde talep etmelisiniz. En iyisi boşanma davasıyla birlikte istemektir." },
  { category: "aile_hukuku", subcategory: "Nafaka Artırım", duration: "Süresiz", durationMonths: 9999, legalBasis: "TMK m.176", description: "Koşullar değiştiğinde her zaman istenebilir", warnings: [], plainExplanation: "Mahkemenin belirlediği nafaka miktarı yetersiz kaldıysa (enflasyon, çocuğun okul masrafları vs.) artırım isteyebilirsiniz. Herhangi bir süre sınırı yoktur." },
  { category: "aile_hukuku", subcategory: "Velayet Değişikliği", duration: "Süresiz", durationMonths: 9999, legalBasis: "TMK m.183", description: "Koşullar değiştiğinde her zaman istenebilir", warnings: ["Çocuğun üstün yararı esastır"], plainExplanation: "Çocuğunuzun velayetini almak veya mevcut velayet kararını değiştirmek için açılan davadır. Çocuğun bakımı, eğitimi veya güvenliği risk altındaysa her zaman talep edebilirsiniz." },

  // TÜKETİCİ HUKUKU
  { category: "tuketici_hukuku", subcategory: "Ayıplı Mal (Açık Ayıp)", duration: "6 ay", durationMonths: 6, legalBasis: "TKHK m.12", description: "Malın tesliminden itibaren", warnings: ["30 gün içinde satıcıya bildirmelisiniz"], plainExplanation: "Satın aldığınız üründe gözle görülebilen bir kusur varsa (çizik, kırık, renk farkı gibi), 6 ay içinde iade veya değişim isteyebilirsiniz. Kusuru fark ettiğinizde 30 gün içinde satıcıya bildirmeniz gerekir." },
  { category: "tuketici_hukuku", subcategory: "Ayıplı Mal (Gizli Ayıp)", duration: "2 yıl", durationMonths: 24, legalBasis: "TKHK m.12", description: "Malın tesliminden itibaren", warnings: ["Ayıp fark edildiğinde derhal bildirilmelidir"], plainExplanation: "Ürünü kullanırken ortaya çıkan gizli kusurlar için (örneğin 3 ay sonra bozulan telefon, motor arızası çıkan araba) 2 yıl içinde şikayet edebilirsiniz." },
  { category: "tuketici_hukuku", subcategory: "Cayma Hakkı", duration: "14 gün", durationMonths: 0.5, legalBasis: "TKHK m.43", description: "Malın teslimine veya sözleşme tarihinden itibaren", warnings: ["Mesafeli satışlarda geçerlidir", "Süre çok kısa!"], plainExplanation: "İnternetten veya kapıdan satış yoluyla aldığınız ürünü, herhangi bir sebep göstermeden 14 gün içinde iade edebilirsiniz. Mağazadan yüz yüze yapılan alışverişlerde bu hak yoktur." },

  // KİRA HUKUKU
  { category: "kira_hukuku", subcategory: "Kira Alacağı", duration: "5 yıl", durationMonths: 60, legalBasis: "TBK m.147", description: "Her kira döneminden itibaren ayrı ayrı", warnings: [], plainExplanation: "Kiracınız kira borcunu ödemediyse, son 5 yılın ödenmeyen kiralarını talep edebilirsiniz. Her ayın kirası için ayrı ayrı zamanaşımı işler." },
  { category: "kira_hukuku", subcategory: "Tahliye (İhtiyaç)", duration: "1 ay", durationMonths: 1, legalBasis: "TBK m.350", description: "Kira süresinin bitiminden itibaren", warnings: ["Kira bitiş tarihinden itibaren 1 ay içinde açılmalı"], plainExplanation: "Ev sahibi olarak kendiniz veya yakınlarınız oturacaksa, kiracıdan evi boşaltmasını isteyebilirsiniz. Kira sözleşmesi bittikten sonra 1 ay içinde dava açmalısınız." },
  { category: "kira_hukuku", subcategory: "Kira Tespit", duration: "Her zaman", durationMonths: 9999, legalBasis: "TBK m.344", description: "Yeni kira dönemi başlamadan 30 gün önce", warnings: ["İhtar çekilmesi önemlidir"], plainExplanation: "Kiranızın piyasa değerinin altında kaldığını düşünüyorsanız, mahkemeden kira bedelinin yeniden belirlenmesini isteyebilirsiniz. 5 yıldan uzun süreli kiracılar için geçerlidir." },

  // CEZA HUKUKU
  { category: "ceza_hukuku", subcategory: "Şikayet (Takibi Şikayete Bağlı)", duration: "6 ay", durationMonths: 6, legalBasis: "TCK m.73", description: "Fiili ve faili öğrenme tarihinden itibaren", warnings: ["Süre çok kısa! Hemen şikayette bulunun"], plainExplanation: "Bazı suçlar (hakaret, tehdit gibi) ancak siz şikayet ederseniz soruşturulur. Suçu ve suçluyu öğrendiğiniz tarihten itibaren 6 ay içinde savcılığa veya karakola şikayette bulunmalısınız." },
  { category: "ceza_hukuku", subcategory: "Hakaret", duration: "6 ay", durationMonths: 6, legalBasis: "TCK m.73, m.125", description: "Fiili ve faili öğrenme tarihinden itibaren", warnings: ["Şikayete bağlı suçtur"], plainExplanation: "Birisi size hakaret ettiyse (yüz yüze, telefonda veya sosyal medyada) 6 ay içinde şikayette bulunabilirsiniz. Ekran görüntüsü, mesaj kaydı gibi deliller önemlidir." },
  { category: "ceza_hukuku", subcategory: "Dolandırıcılık", duration: "8 yıl", durationMonths: 96, legalBasis: "TCK m.66", description: "Suç tarihinden itibaren", warnings: ["Re'sen soruşturulur, şikayet gerekmez"], plainExplanation: "Birisi sizi kandırarak paranızı veya malınızı aldıysa, bu dolandırıcılık suçudur. Şikayetinize gerek olmadan savcılık kendiliğinden soruşturma yapabilir. 8 yıl içinde dava açılabilir." },

  // TİCARET HUKUKU
  { category: "ticaret_hukuku", subcategory: "Haksız Rekabet", duration: "1 yıl", durationMonths: 12, legalBasis: "TTK m.56", description: "Fiilin öğrenilmesinden itibaren (her halde 3 yıl)", warnings: [], plainExplanation: "Rakip bir firma sizin müşteri listenizi çaldıysa, ürününüzü taklit ettiyse veya haksız yollarla rekabet ediyorsa 1 yıl içinde dava açabilirsiniz." },
  { category: "ticaret_hukuku", subcategory: "Çek Alacağı", duration: "3 yıl", durationMonths: 36, legalBasis: "TTK m.814", description: "İbraz süresinin bitiminden itibaren", warnings: [], plainExplanation: "Size verilen çek karşılıksız çıktıysa, 3 yıl içinde çek bedelini tahsil etmek için hukuki işlem başlatabilirsiniz." },

  // MİRAS HUKUKU
  { category: "miras_hukuku", subcategory: "Tenkis Davası", duration: "10 yıl", durationMonths: 120, legalBasis: "TMK m.571", description: "Mirasın açılmasından itibaren (öğrenmeden: 1 yıl)", warnings: ["1 yıllık hak düşürücü süre de vardır"], plainExplanation: "Vefat eden kişi, mallarını vasiyetname ile sadece bir kişiye bıraktıysa ve sizin yasal miras payınız (saklı pay) ihlal edildiyse, hakkınızı geri almak için açtığınız davadır. Ölümden itibaren 10 yıl, öğrendiğinizden itibaren 1 yıl." },
  { category: "miras_hukuku", subcategory: "Mirasın Reddi", duration: "3 ay", durationMonths: 3, legalBasis: "TMK m.606", description: "Ölümü öğrenme tarihinden itibaren", warnings: ["Süre çok kısa! Hemen başvurun", "Sulh hukuk mahkemesine başvurulur"], plainExplanation: "Vefat eden kişinin borçları mallarından fazlaysa, mirası reddedebilirsiniz. Böylece borçlar size geçmez. DİKKAT: Ölümü öğrendiğinizden itibaren sadece 3 AY içinde sulh hukuk mahkemesine başvurmalısınız!" },

  // İDARE HUKUKU
  { category: "idare_hukuku", subcategory: "İptal Davası", duration: "60 gün", durationMonths: 2, legalBasis: "İYUK m.7", description: "İdari işlemin tebliğinden itibaren", warnings: ["Süre kısadır, hemen harekete geçin"], plainExplanation: "Devlet kurumlarının (belediye, valilik, bakanlık vb.) aldığı bir kararın hukuka aykırı olduğunu düşünüyorsanız, iptal davası açabilirsiniz. Karar size tebliğ edildikten sonra 60 gün içinde açmalısınız." },
  { category: "idare_hukuku", subcategory: "Tam Yargı Davası", duration: "1 yıl", durationMonths: 12, legalBasis: "İYUK m.13", description: "Zararın öğrenilmesinden itibaren", warnings: ["İdareye başvuru zorunludur"], plainExplanation: "Devlet kurumlarının hatalı işlemi yüzünden maddi veya manevi zarar gördüyseniz, tazminat talep edebilirsiniz. Önce ilgili kuruma yazılı başvuru yapmanız, sonra 1 yıl içinde dava açmanız gerekir." },

  // İCRA İFLAS
  { category: "icra_iflas", subcategory: "İtirazın İptali", duration: "1 yıl", durationMonths: 12, legalBasis: "İİK m.67", description: "İtirazın tebliğinden itibaren", warnings: [], plainExplanation: "Birine icra takibi başlattınız ama karşı taraf itiraz etti mi? İtirazın haksız olduğunu ispatlamak için mahkemeye başvurabilirsiniz. İtiraz size tebliğ edildikten sonra 1 yıl içinde dava açmalısınız." },
  { category: "icra_iflas", subcategory: "Menfi Tespit", duration: "Süresiz", durationMonths: 9999, legalBasis: "İİK m.72", description: "Borcun ödenmesine kadar", warnings: ["Ödeme yapıldıysa istirdat davasına dönüşür"], plainExplanation: "Size karşı icra takibi başlatıldı ama aslında borçlu değilseniz, borçlu olmadığınızı ispatlamak için açtığınız davadır. Borcu ödemediğiniz sürece her zaman açabilirsiniz. Eğer borcu zaten ödediyseniz, ödediğiniz parayı geri almak için 'istirdat davası' açarsınız." },
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
