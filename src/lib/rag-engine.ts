/**
 * RAG (Retrieval Augmented Generation) Engine
 * AI'a cevap vermeden önce ilgili kanun metinlerini bulup prompt'a ekler
 * Bu sayede AI uydurma yapmaz, gerçek kanun metnine dayanarak cevap verir
 */

import { KATEGORI_KANUNLAR, TEMEL_KANUNLAR } from "./mevzuat-client";

// Kritik kanun maddeleri - tam metin (en sık sorulan maddeler)
const KANUN_METINLERI: Record<string, Record<number, string>> = {
  "İK": {
    17: `İK md. 17 - Süreli fesih (İhbar Tazminatı):
Belirsiz süreli iş sözleşmelerinin feshinden önce durumun diğer tarafa bildirilmesi gerekir.
- 6 aydan az çalışma: 2 hafta
- 6 ay - 1.5 yıl: 4 hafta
- 1.5 - 3 yıl: 6 hafta
- 3 yıldan fazla: 8 hafta
Bildirim süresine uymayan taraf, bildirim süresine ilişkin ücret tutarında ihbar tazminatı öder.`,

    18: `İK md. 18 - Feshin geçerli sebebe dayandırılması:
Otuz veya daha fazla işçi çalıştıran işyerlerinde en az altı aylık kıdemi olan işçinin belirsiz süreli iş sözleşmesini fesheden işveren, feshin geçerli bir sebebe dayandığını ispat etmekle yükümlüdür.`,

    20: `İK md. 20 - İşe iade davası:
İş sözleşmesi feshedilen işçi, fesih bildiriminin tebliği tarihinden itibaren bir ay içinde arabulucuya başvurmak zorundadır. Arabuluculuk faaliyeti sonunda anlaşmaya varılamaması hâlinde, son tutanağın düzenlendiği tarihten itibaren iki hafta içinde iş mahkemesine dava açabilir.`,

    24: `İK md. 24 - İşçinin haklı nedenle derhal fesih hakkı:
I. Sağlık sebepleri, II. Ahlak ve iyi niyet kurallarına uymayan haller (ücretin ödenmemesi, mobbing, cinsel taciz vb.), III. Zorlayıcı sebepler.
Bu hallerde işçi kıdem tazminatına hak kazanır.`,

    25: `İK md. 25 - İşverenin haklı nedenle derhal fesih hakkı:
I. Sağlık sebepleri, II. Ahlak ve iyi niyet kurallarına uymayan haller (devamsızlık, hırsızlık, sadakatsizlik vb.), III. Zorlayıcı sebepler.
II. bent dışındaki hallerde işçi kıdem tazminatına hak kazanır.`,

    32: `İK md. 32 - Ücret:
Genel anlamda ücret bir kimseye bir iş karşılığında işveren veya üçüncü kişiler tarafından sağlanan ve para ile ödenen tutardır. Ücret en geç ayda bir ödenir. İşveren, işçinin ücretini kanun hükümleri veya sözleşme şartlarına uygun olarak ödemez ise işçi, iş görme borcunu yerine getirmekten kaçınabilir.`,

    41: `İK md. 41 - Fazla çalışma ücreti:
Haftalık 45 saati aşan çalışmalar fazla çalışmadır. Her bir saat fazla çalışma için verilecek ücret normal çalışma ücretinin saat başına düşen miktarının %50 yükseltilmesi suretiyle ödenir. Yıllık fazla çalışma 270 saati geçemez.`,

    112: `İK md. 112 - Kıdem tazminatı:
İşçinin her tam yıl için işverence 30 günlük ücreti tutarında kıdem tazminatı ödenir. Bir yıldan artan süreler için de aynı oran üzerinden ödeme yapılır. Kıdem tazminatının hesabında son ücret esas alınır.`,
  },

  "TBK": {
    49: `TBK md. 49 - Sorumluluk:
Kusurlu ve hukuka aykırı bir fiille başkasına zarar veren, bu zararı gidermekle yükümlüdür.`,

    146: `TBK md. 146 - On yıllık zamanaşımı:
Kanunda aksine bir hüküm bulunmadıkça, her alacak on yıllık zamanaşımına tabidir.`,

    147: `TBK md. 147 - Beş yıllık zamanaşımı:
Kira bedelleri, nafaka, faiz, ücret gibi dönemsel edimler, otel, lokanta masrafları, vekaletsiz iş görme, ticari satıştan doğan alacaklar 5 yıllık zamanaşımına tabidir.`,

    299: `TBK md. 299 - Kira sözleşmesi:
Kira sözleşmesi, kiraya verenin bir şeyin kullanılmasını veya kullanmayla birlikte ondan yararlanılmasını kiracıya bırakmayı, kiracının da buna karşılık kararlaştırılan kira bedelini ödemeyi üstlendiği sözleşmedir.`,

    344: `TBK md. 344 - Kira bedelinin belirlenmesi:
Tarafların yenilenen kira dönemlerinde uygulanacak kira bedeline ilişkin anlaşmaları, bir önceki kira yılında tüketici fiyat endeksindeki on iki aylık ortalamalara göre değişim oranını geçmemek koşuluyla geçerlidir.`,

    347: `TBK md. 347 - Bildirim yoluyla sona erdirme:
Konut ve çatılı işyeri kiralarında kiracı, belirli süreli sözleşmelerin süresinin bitiminden en az onbeş gün önce bildirimde bulunmadıkça, sözleşme aynı koşullarla bir yıl için uzatılmış sayılır. Kiraya veren, sözleşme süresinin bitimine dayanarak sözleşmeyi sona erdiremez. Ancak, on yıllık uzama süresi sonunda kiraya veren, bu süreyi izleyen her uzama yılının bitiminden en az üç ay önce bildirimde bulunmak koşuluyla, herhangi bir sebep göstermeksizin sözleşmeye son verebilir.`,
  },

  "TMK": {
    2: `TMK md. 2 - Dürüstlük kuralı:
Herkes, haklarını kullanırken ve borçlarını yerine getirirken dürüstlük kurallarına uymak zorundadır. Bir hakkın açıkça kötüye kullanılmasını hukuk düzeni korumaz.`,

    166: `TMK md. 166 - Evlilik birliğinin sarsılması:
Evlilik birliği, ortak hayatı sürdürmeleri kendilerinden beklenmeyecek derecede temelinden sarsılmış olursa, eşlerden her biri boşanma davası açabilir.`,

    174: `TMK md. 174 - Tazminat:
Mevcut veya beklenen menfaatleri boşanma yüzünden zedelenen kusursuz veya daha az kusurlu taraf, kusurlu taraftan uygun bir maddi tazminat isteyebilir. Boşanmaya sebep olan olaylar yüzünden kişilik hakkı saldırıya uğrayan taraf, kusurlu olan diğer taraftan manevi tazminat olarak uygun miktarda bir para ödenmesini isteyebilir.`,

    175: `TMK md. 175 - Yoksulluk nafakası:
Boşanma yüzünden yoksulluğa düşecek taraf, kusuru daha ağır olmamak koşuluyla geçimi için diğer taraftan malî gücü oranında süresiz olarak nafaka isteyebilir.`,

    505: `TMK md. 505 - Saklı paylı mirasçılar:
Altsoy için yasal miras payının yarısı, ana ve babadan her biri için yasal miras payının dörtte biri, sağ kalan eş için altsoy veya ana-baba ile birlikte mirasçı olması hâlinde yasal miras payının tamamı saklı paydır.`,
  },

  "TKHK": {
    11: `TKHK md. 11 - Tüketicinin seçimlik hakları:
Malın ayıplı olduğunun anlaşılması durumunda tüketici;
a) Satılanı geri vermeye hazır olduğunu bildirerek sözleşmeden dönme,
b) Satılanı alıkoyup ayıp oranında satış bedelinden indirim isteme,
c) Aşırı bir masraf gerektirmediği takdirde, bütün masrafları satıcıya ait olmak üzere satılanın ücretsiz onarılmasını isteme,
d) İmkân varsa, satılanın ayıpsız bir misli ile değiştirilmesini isteme haklarına sahiptir.`,

    48: `TKHK md. 48 - Cayma hakkı:
Tüketici, mesafeli sözleşme veya işyeri dışında kurulan sözleşmenin kurulmasından itibaren on dört gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.`,
  },

  "TCK": {
    86: `TCK md. 86 - Kasten yaralama:
Kasten başkasının vücuduna acı veren veya sağlığının ya da algılama yeteneğinin bozulmasına neden olan kişi, bir yıldan üç yıla kadar hapis cezası ile cezalandırılır.`,

    125: `TCK md. 125 - Hakaret:
Bir kimseye onur, şeref ve saygınlığını rencide edebilecek nitelikte somut bir fiil veya olgu isnat eden veya sövmek suretiyle bir kimsenin onur, şeref ve saygınlığına saldıran kişi, üç aydan iki yıla kadar hapis veya adlî para cezası ile cezalandırılır.`,

    157: `TCK md. 157 - Dolandırıcılık:
Hileli davranışlarla bir kimseyi aldatıp, onun veya başkasının zararına olarak, kendisine veya başkasına bir yarar sağlayan kişiye bir yıldan beş yıla kadar hapis ve beşbin güne kadar adlî para cezası verilir.`,
  },

  "Anayasa": {
    36: `Anayasa md. 36 - Hak arama hürriyeti:
Herkes, meşru vasıta ve yollardan faydalanmak suretiyle yargı mercileri önünde davacı veya davalı olarak iddia ve savunma ile adil yargılanma hakkına sahiptir.`,

    38: `Anayasa md. 38 - Suç ve cezalara ilişkin esaslar:
Kimse, işlendiği zaman yürürlükte bulunan kanunun suç saymadığı bir fiilden dolayı cezalandırılamaz; kimseye suçu işlediği zaman kanunda o suç için konulmuş olan cezadan daha ağır bir ceza verilemez. Suçluluğu hükmen sabit oluncaya kadar, kimse suçlu sayılamaz.`,
  },
};

// Kategori → anahtar kelime → ilgili maddeler eşleştirmesi
const KEYWORD_TO_ARTICLES: Record<string, { kanun: string; maddeler: number[] }[]> = {
  "kıdem tazminatı": [{ kanun: "İK", maddeler: [112, 17, 24, 25] }],
  "ihbar tazminatı": [{ kanun: "İK", maddeler: [17] }],
  "işe iade": [{ kanun: "İK", maddeler: [18, 20, 21] }],
  "fazla mesai": [{ kanun: "İK", maddeler: [41] }],
  "haklı fesih": [{ kanun: "İK", maddeler: [24, 25] }],
  "mobbing": [{ kanun: "İK", maddeler: [24] }],
  "ücret": [{ kanun: "İK", maddeler: [32, 34] }],
  "kira artış": [{ kanun: "TBK", maddeler: [344] }],
  "tahliye": [{ kanun: "TBK", maddeler: [347, 350, 352] }],
  "kira sözleşme": [{ kanun: "TBK", maddeler: [299, 344, 347] }],
  "boşanma": [{ kanun: "TMK", maddeler: [166, 161, 162, 163, 164] }],
  "nafaka": [{ kanun: "TMK", maddeler: [175, 176] }],
  "tazminat boşanma": [{ kanun: "TMK", maddeler: [174] }],
  "miras": [{ kanun: "TMK", maddeler: [495, 505, 506] }],
  "saklı pay": [{ kanun: "TMK", maddeler: [505, 506] }],
  "ayıplı mal": [{ kanun: "TKHK", maddeler: [11, 8] }],
  "cayma hakkı": [{ kanun: "TKHK", maddeler: [48] }],
  "iade": [{ kanun: "TKHK", maddeler: [11, 48] }],
  "tüketici": [{ kanun: "TKHK", maddeler: [11, 48, 68] }],
  "hakaret": [{ kanun: "TCK", maddeler: [125] }],
  "dolandırıcılık": [{ kanun: "TCK", maddeler: [157] }],
  "yaralama": [{ kanun: "TCK", maddeler: [86] }],
  "zamanaşımı": [{ kanun: "TBK", maddeler: [146, 147] }],
  "haksız fiil": [{ kanun: "TBK", maddeler: [49, 50, 51, 56] }],
  "dürüstlük": [{ kanun: "TMK", maddeler: [2] }],
  "adil yargılanma": [{ kanun: "Anayasa", maddeler: [36] }],
};

/**
 * Kullanıcının sorusuna göre ilgili kanun metinlerini bul
 * Bu metinler AI'ın prompt'una eklenir (RAG)
 */
export function findRelevantLawTexts(question: string, category?: string): string {
  const questionLower = question.toLowerCase();
  const foundTexts: string[] = [];
  const addedKeys = new Set<string>();

  // 1. Anahtar kelime eşleştirmesi
  for (const [keyword, articles] of Object.entries(KEYWORD_TO_ARTICLES)) {
    if (questionLower.includes(keyword)) {
      for (const { kanun, maddeler } of articles) {
        for (const madde of maddeler) {
          const key = `${kanun}_${madde}`;
          if (addedKeys.has(key)) continue;
          const text = KANUN_METINLERI[kanun]?.[madde];
          if (text) {
            foundTexts.push(text);
            addedKeys.add(key);
          }
        }
      }
    }
  }

  // 2. Kategori bazlı temel maddeler
  if (category && foundTexts.length < 3) {
    const kanunKeys = KATEGORI_KANUNLAR[category] || [];
    for (const kanunKey of kanunKeys) {
      const kanunInfo = TEMEL_KANUNLAR[kanunKey];
      if (!kanunInfo) continue;
      const kisaAd = kanunInfo.kisaAd;
      const maddeler = KANUN_METINLERI[kisaAd];
      if (!maddeler) continue;
      for (const [maddeNo, text] of Object.entries(maddeler)) {
        const key = `${kisaAd}_${maddeNo}`;
        if (addedKeys.has(key)) continue;
        if (foundTexts.length >= 5) break; // Max 5 madde
        foundTexts.push(text);
        addedKeys.add(key);
      }
    }
  }

  if (foundTexts.length === 0) return "";

  return `\n\n--- İLGİLİ KANUN MADDELERİ (Gerçek metin, bu maddelere dayanarak cevap ver) ---\n\n${foundTexts.join("\n\n")}`;
}

/**
 * RAG context boyutunu kontrol et (token limiti)
 */
export function trimRagContext(context: string, maxChars: number = 3000): string {
  if (context.length <= maxChars) return context;
  return context.slice(0, maxChars) + "\n\n[... daha fazla madde için detaylı arama yapın]";
}
