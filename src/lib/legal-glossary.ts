export interface LegalTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

export const LEGAL_GLOSSARY: LegalTerm[] = [
  // ── Genel Hukuk ──
  {
    term: "Dava",
    definition: "Bir hakkın yerine getirilmesi veya korunması amacıyla mahkemeye başvurma işlemi.",
    category: "Genel",
    relatedTerms: ["Davacı", "Davalı", "Mahkeme"],
  },
  {
    term: "Davacı",
    definition: "Bir davayı açan, hakkının korunmasını veya yerine getirilmesini talep eden taraf.",
    category: "Genel",
    relatedTerms: ["Davalı", "Dava", "Müdahil"],
  },
  {
    term: "Davalı",
    definition: "Kendisine karşı dava açılan taraf.",
    category: "Genel",
    relatedTerms: ["Davacı", "Dava"],
  },
  {
    term: "Hâkim",
    definition: "Yargılama yetkisine sahip olan, uyuşmazlıkları çözmekle görevli kişi.",
    category: "Genel",
    relatedTerms: ["Mahkeme", "Karar", "Hüküm"],
  },
  {
    term: "Mahkeme",
    definition: "Adalet hizmetlerinin yürütüldüğü, yargılama faaliyetlerinin gerçekleştirildiği devlet organı.",
    category: "Genel",
    relatedTerms: ["Hâkim", "Duruşma", "Karar"],
  },
  {
    term: "Kanun",
    definition: "TBMM tarafından kabul edilen, genel ve soyut nitelikteki yazılı hukuk kuralları.",
    category: "Genel",
    relatedTerms: ["Tüzük", "Yönetmelik"],
  },
  {
    term: "Tüzük",
    definition: "Kanunların uygulanmasını göstermek veya emrettiği işleri belirtmek üzere çıkarılan düzenleyici işlem.",
    category: "Genel",
    relatedTerms: ["Kanun", "Yönetmelik"],
  },
  {
    term: "Yönetmelik",
    definition: "Başbakanlık, bakanlıklar ve kamu tüzel kişilerinin kendi görev alanlarını ilgilendiren kanun ve tüzüklerin uygulanmasını sağlamak üzere çıkardıkları düzenleyici işlem.",
    category: "Genel",
    relatedTerms: ["Kanun", "Tüzük"],
  },
  {
    term: "İçtihat",
    definition: "Yargı organlarının benzer davalarda verdikleri kararlarla oluşan hukuki yorum ve uygulamalar bütünü.",
    category: "Genel",
    relatedTerms: ["Emsal Karar"],
  },
  {
    term: "Emsal Karar",
    definition: "Benzer davalarda yol gösterici nitelikte olan, daha önce verilmiş yargı kararı.",
    category: "Genel",
    relatedTerms: ["İçtihat"],
  },
  {
    term: "Müdahil",
    definition: "Görülmekte olan bir davaya, taraflardan birinin yanında katılan üçüncü kişi (asli müdahil).",
    category: "Genel",
    relatedTerms: ["Fer'i Müdahil", "Davacı", "Davalı"],
  },
  {
    term: "Fer'i Müdahil",
    definition: "Davanın tarafı olmamakla birlikte, taraflardan birinin kazanmasında hukuki yararı bulunan ve davaya katılan kişi.",
    category: "Genel",
    relatedTerms: ["Müdahil"],
  },
  {
    term: "Temyiz",
    definition: "Bölge adliye mahkemesi kararlarına karşı Yargıtay'a yapılan üst derece kanun yolu başvurusu.",
    category: "Genel",
    relatedTerms: ["İstinaf", "Kesinleşme"],
  },
  {
    term: "İstinaf",
    definition: "İlk derece mahkemesi kararlarına karşı bölge adliye mahkemesine yapılan olağan kanun yolu başvurusu.",
    category: "Genel",
    relatedTerms: ["Temyiz", "Kesinleşme"],
  },
  {
    term: "Kesinleşme",
    definition: "Mahkeme kararının olağan kanun yollarına başvuru süresinin dolması veya kanun yollarının tüketilmesiyle kesin hale gelmesi.",
    category: "Genel",
    relatedTerms: ["Temyiz", "İstinaf", "İnfaz"],
  },
  {
    term: "Tebligat",
    definition: "Hukuki işlemlerin ilgili kişilere usulüne uygun şekilde bildirilmesi.",
    category: "Genel",
    relatedTerms: ["Müzekkere"],
  },
  {
    term: "Müzekkere",
    definition: "Mahkemenin resmi kurum ve kuruluşlara bilgi veya belge talep etmek için yazdığı resmi yazı.",
    category: "Genel",
    relatedTerms: ["Tebligat"],
  },
  {
    term: "Tensip",
    definition: "Davanın açılmasından sonra hâkimin ilk incelemeyi yaparak yargılama usulünü belirlediği ara karar.",
    category: "Genel",
    relatedTerms: ["Duruşma", "Dava"],
  },
  {
    term: "Duruşma",
    definition: "Tarafların ve vekillerinin mahkeme huzurunda iddia ve savunmalarını sözlü olarak ileri sürdükleri yargılama oturumu.",
    category: "Genel",
    relatedTerms: ["Mahkeme", "Hâkim", "Karar"],
  },
  {
    term: "Karar",
    definition: "Mahkemenin yargılama sonucunda verdiği hukuki sonuç.",
    category: "Genel",
    relatedTerms: ["Hüküm", "Kesinleşme"],
  },
  {
    term: "Hüküm",
    definition: "Mahkemenin davanın esasına ilişkin verdiği nihai karar.",
    category: "Genel",
    relatedTerms: ["Karar", "İnfaz"],
  },
  {
    term: "İnfaz",
    definition: "Kesinleşmiş mahkeme kararlarının yerine getirilmesi.",
    category: "Genel",
    relatedTerms: ["Kesinleşme", "Hüküm"],
  },

  // ── İş Hukuku ──
  {
    term: "Kıdem Tazminatı",
    definition: "İşçinin en az bir yıl çalışması halinde, kanunda belirtilen nedenlerle iş sözleşmesinin sona ermesi durumunda işverenin ödemekle yükümlü olduğu tazminat.",
    category: "İş Hukuku",
    relatedTerms: ["İhbar Tazminatı", "Haklı Fesih"],
  },
  {
    term: "İhbar Tazminatı",
    definition: "İş sözleşmesini fesheden tarafın, kanunda öngörülen bildirim süresine uymadan fesih yapması halinde karşı tarafa ödemesi gereken tazminat.",
    category: "İş Hukuku",
    relatedTerms: ["Kıdem Tazminatı", "Haksız Fesih"],
  },
  {
    term: "Fazla Mesai",
    definition: "İş Kanunu'na göre haftalık 45 saati aşan çalışma süreleri. Her bir saat fazla çalışma için normal ücretin %50 zamlı hali ödenir.",
    category: "İş Hukuku",
    relatedTerms: ["Kıdem Tazminatı"],
  },
  {
    term: "Haklı Fesih",
    definition: "İşçi veya işverenin, kanunda sayılan haklı nedenlerden birine dayanarak iş sözleşmesini derhal sona erdirmesi.",
    category: "İş Hukuku",
    relatedTerms: ["Haksız Fesih", "Kıdem Tazminatı", "İhbar Tazminatı"],
  },
  {
    term: "Haksız Fesih",
    definition: "İş sözleşmesinin geçerli veya haklı bir sebep olmaksızın sona erdirilmesi.",
    category: "İş Hukuku",
    relatedTerms: ["Haklı Fesih", "İşe İade"],
  },
  {
    term: "İşe İade",
    definition: "İş güvencesi kapsamındaki işçinin haksız fesih durumunda mahkeme kararıyla işe geri alınması talebi.",
    category: "İş Hukuku",
    relatedTerms: ["Haksız Fesih", "İş Güvencesi"],
  },
  {
    term: "İş Güvencesi",
    definition: "En az 30 işçi çalışan işyerlerinde, en az 6 aylık kıdemi olan işçilerin keyfi olarak işten çıkarılmasını engelleyen koruma sistemi.",
    category: "İş Hukuku",
    relatedTerms: ["İşe İade", "Haksız Fesih"],
  },
  {
    term: "Toplu İş Sözleşmesi",
    definition: "İşçi sendikası ile işveren veya işveren sendikası arasında, çalışma koşullarını ve karşılıklı hak ve borçları düzenleyen yazılı sözleşme.",
    category: "İş Hukuku",
    relatedTerms: ["Sendika"],
  },
  {
    term: "Sendika",
    definition: "İşçilerin veya işverenlerin çalışma ilişkilerinde ortak ekonomik ve sosyal hak ve çıkarlarını korumak amacıyla kurdukları tüzel kişilik.",
    category: "İş Hukuku",
    relatedTerms: ["Toplu İş Sözleşmesi"],
  },

  // ── Ceza Hukuku ──
  {
    term: "Sanık",
    definition: "Hakkında ceza davası açılmış olan, suç isnadı altında bulunan kişi.",
    category: "Ceza Hukuku",
    relatedTerms: ["Mağdur", "Müşteki", "Beraat", "Mahkumiyet"],
  },
  {
    term: "Mağdur",
    definition: "Suçtan doğrudan zarar gören kişi.",
    category: "Ceza Hukuku",
    relatedTerms: ["Müşteki", "Sanık"],
  },
  {
    term: "Müşteki",
    definition: "Suç nedeniyle şikâyette bulunan, şikâyetçi olan kişi.",
    category: "Ceza Hukuku",
    relatedTerms: ["Mağdur", "Sanık"],
  },
  {
    term: "Tutuklama",
    definition: "Suç şüphesi altındaki kişinin, hâkim kararıyla özgürlüğünün geçici olarak kısıtlanması tedbiri.",
    category: "Ceza Hukuku",
    relatedTerms: ["Gözaltı"],
  },
  {
    term: "Gözaltı",
    definition: "Yakalanan kişinin, Cumhuriyet savcısının emriyle belirli süreyle özgürlüğünün kısıtlanması.",
    category: "Ceza Hukuku",
    relatedTerms: ["Tutuklama"],
  },
  {
    term: "Beraat",
    definition: "Sanığın isnat edilen suçtan aklanması, suçsuz bulunması kararı.",
    category: "Ceza Hukuku",
    relatedTerms: ["Mahkumiyet", "Sanık"],
  },
  {
    term: "Mahkumiyet",
    definition: "Sanığın isnat edilen suçtan suçlu bulunarak cezalandırılması kararı.",
    category: "Ceza Hukuku",
    relatedTerms: ["Beraat", "Ceza İndirimi", "Erteleme"],
  },
  {
    term: "Ceza İndirimi",
    definition: "Kanunda belirtilen koşulların varlığında sanığa verilecek cezanın indirilmesi.",
    category: "Ceza Hukuku",
    relatedTerms: ["Mahkumiyet", "Erteleme"],
  },
  {
    term: "Erteleme",
    definition: "Mahkumiyet kararı verildikten sonra cezanın infazının belirli koşullarla ertelenmesi.",
    category: "Ceza Hukuku",
    relatedTerms: ["Mahkumiyet", "HAGB"],
  },
  {
    term: "HAGB",
    definition: "Hükmün Açıklanmasının Geri Bırakılması: Sanık hakkında kurulan hükmün, belirli bir denetim süresi boyunca açıklanmaması ve koşullar yerine getirildiğinde davanın düşürülmesi kurumu.",
    category: "Ceza Hukuku",
    relatedTerms: ["Erteleme", "Mahkumiyet"],
  },

  // ── Aile Hukuku ──
  {
    term: "Nafaka",
    definition: "Kanunun belirlediği koşullarda bir kişinin geçimini sağlamak için yapılması gereken parasal ödeme (iştirak, yoksulluk, tedbir nafakası).",
    category: "Aile Hukuku",
    relatedTerms: ["Boşanma", "Velayet"],
  },
  {
    term: "Velayet",
    definition: "Ana ve babanın, çocuğun bakımı, eğitimi ve korunması konusundaki hak ve yükümlülükleri.",
    category: "Aile Hukuku",
    relatedTerms: ["Nafaka", "Boşanma"],
  },
  {
    term: "Boşanma",
    definition: "Evlilik birliğinin, kanunda öngörülen sebeplerden birine dayanılarak mahkeme kararıyla sona erdirilmesi.",
    category: "Aile Hukuku",
    relatedTerms: ["Nafaka", "Velayet", "Tazminat", "Mal Rejimi"],
  },
  {
    term: "Tazminat (Aile)",
    definition: "Boşanmaya neden olan olaylarda kusuru az olan veya kusursuz eşin, diğer eşten talep edebileceği maddi ve manevi tazminat.",
    category: "Aile Hukuku",
    relatedTerms: ["Boşanma"],
  },
  {
    term: "Mal Rejimi",
    definition: "Eşlerin evlilik birliği süresince edinilen mallar üzerindeki hak ve yükümlülüklerini düzenleyen hukuki sistem.",
    category: "Aile Hukuku",
    relatedTerms: ["Edinilmiş Mallara Katılma", "Boşanma"],
  },
  {
    term: "Edinilmiş Mallara Katılma",
    definition: "Türk hukukunda yasal mal rejimi olan, evlilik süresince emek karşılığı edinilen malların boşanma halinde eşit paylaşımını öngören rejim.",
    category: "Aile Hukuku",
    relatedTerms: ["Mal Rejimi", "Boşanma"],
  },
  {
    term: "Ziynet Eşyası",
    definition: "Evlenme sırasında takılan altın, mücevher gibi değerli eşyalar. Kural olarak kadına ait kabul edilir.",
    category: "Aile Hukuku",
    relatedTerms: ["Boşanma", "Mal Rejimi"],
  },

  // ── İcra Hukuku ──
  {
    term: "Haciz",
    definition: "Borçlunun borcunu ödememesi halinde, alacaklının talebiyle borçlunun mal ve haklarına icra dairesi tarafından el konulması işlemi.",
    category: "İcra Hukuku",
    relatedTerms: ["İcra Takibi", "Rehin", "İpotek"],
  },
  {
    term: "Rehin",
    definition: "Bir alacağın güvence altına alınması amacıyla taşınır bir mal üzerinde kurulan sınırlı ayni hak.",
    category: "İcra Hukuku",
    relatedTerms: ["İpotek", "Haciz"],
  },
  {
    term: "İpotek",
    definition: "Bir alacağın güvence altına alınması amacıyla taşınmaz üzerinde kurulan sınırlı ayni hak.",
    category: "İcra Hukuku",
    relatedTerms: ["Rehin", "Haciz"],
  },
  {
    term: "İflas",
    definition: "Borçlarını ödeyemeyen tacirin, mahkeme kararıyla tüm mal varlığının tasfiye edilmesi süreci.",
    category: "İcra Hukuku",
    relatedTerms: ["Konkordato"],
  },
  {
    term: "Konkordato",
    definition: "Mali durumu bozulan borçlunun, alacaklılarıyla anlaşarak borçlarını yeniden yapılandırması için başvurduğu hukuki yol.",
    category: "İcra Hukuku",
    relatedTerms: ["İflas"],
  },
  {
    term: "İcra Takibi",
    definition: "Alacaklının, borçludan alacağını tahsil etmek amacıyla icra dairesi aracılığıyla başlattığı yasal süreç.",
    category: "İcra Hukuku",
    relatedTerms: ["Ödeme Emri", "Haciz", "İtiraz"],
  },
  {
    term: "Ödeme Emri",
    definition: "İcra takibi başlatıldığında borçluya gönderilen, borcunu ödemesi veya itiraz etmesi için süre tanıyan resmi bildirim.",
    category: "İcra Hukuku",
    relatedTerms: ["İcra Takibi", "İtiraz"],
  },
  {
    term: "İtiraz",
    definition: "Borçlunun ödeme emrine karşı borcun tamamına veya bir kısmına, icra dairesine süresi içinde yaptığı karşı çıkma işlemi.",
    category: "İcra Hukuku",
    relatedTerms: ["Ödeme Emri", "İcra Takibi"],
  },

  // ── Tüketici Hukuku ──
  {
    term: "Ayıplı Mal",
    definition: "Tüketiciye teslim anında, taraflarca kararlaştırılmış olan veya objektif olarak sahip olması gereken özellikleri taşımayan mal.",
    category: "Tüketici Hukuku",
    relatedTerms: ["Cayma Hakkı", "Garanti"],
  },
  {
    term: "Cayma Hakkı",
    definition: "Tüketicinin, özellikle mesafeli sözleşmelerde, herhangi bir gerekçe göstermeksizin 14 gün içinde sözleşmeden dönme hakkı.",
    category: "Tüketici Hukuku",
    relatedTerms: ["Ayıplı Mal", "Tüketici Hakem Heyeti"],
  },
  {
    term: "Garanti",
    definition: "Üretici veya ithalatçının, malın tüketiciye tesliminden itibaren en az 2 yıl boyunca ücretsiz onarım veya değişim taahhüdü.",
    category: "Tüketici Hukuku",
    relatedTerms: ["Ayıplı Mal"],
  },
  {
    term: "Tüketici Hakem Heyeti",
    definition: "Belirli değerin altındaki tüketici uyuşmazlıklarının çözüldüğü, mahkeme dışı zorunlu başvuru mercii.",
    category: "Tüketici Hukuku",
    relatedTerms: ["Ayıplı Mal", "Cayma Hakkı"],
  },
];

export const GLOSSARY_CATEGORIES = [
  "Tümü",
  "Genel",
  "İş Hukuku",
  "Ceza Hukuku",
  "Aile Hukuku",
  "İcra Hukuku",
  "Tüketici Hukuku",
] as const;

export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

/**
 * Search the glossary by query string. Matches against term, definition, and category.
 */
export function searchGlossary(query: string): LegalTerm[] {
  if (!query.trim()) return LEGAL_GLOSSARY;
  const q = query.toLowerCase().replace(/i̇/g, "i");
  return LEGAL_GLOSSARY.filter(
    (t) =>
      t.term.toLowerCase().replace(/i̇/g, "i").includes(q) ||
      t.definition.toLowerCase().replace(/i̇/g, "i").includes(q) ||
      t.category.toLowerCase().replace(/i̇/g, "i").includes(q)
  );
}

/**
 * Get all terms belonging to a specific category.
 */
export function getTermsByCategory(category: string): LegalTerm[] {
  if (!category || category === "Tümü") return LEGAL_GLOSSARY;
  return LEGAL_GLOSSARY.filter((t) => t.category === category);
}

/**
 * Find legal terms that appear in a given text.
 */
export function findTermInText(text: string): LegalTerm[] {
  if (!text.trim()) return [];
  const lower = text.toLowerCase().replace(/i̇/g, "i");
  return LEGAL_GLOSSARY.filter((t) =>
    lower.includes(t.term.toLowerCase().replace(/i̇/g, "i"))
  );
}
