"use client";

/**
 * Hazır Dilekçe & Belge Şablonları
 */

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  emoji: string;
  description: string;
  difficulty: "kolay" | "orta" | "zor";
  steps: string[];
  template: string;
  requiredDocs: string[];
  whereToSubmit: string;
  deadline?: string;
  cost?: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "ihtar_kira",
    title: "Kira Artış İhtarnamesi",
    category: "Kira Hukuku",
    emoji: "🏠",
    description: "Kiracıya yasal kira artış oranını bildirmek için kullanılır.",
    difficulty: "kolay",
    steps: [
      "Aşağıdaki şablonu doldurun",
      "Noter aracılığıyla kiracıya gönderin",
      "Tebliğ tarihini not edin",
    ],
    template: `İHTARNAME

İHTAR EDEN: [Ad Soyad]
Adres: [Adresiniz]

MUHATAP: [Kiracı Ad Soyad]
Adres: [Kiralanan adres]

KONU: Kira bedelinin güncellenmesi hk.

Sayın Muhatap,

[Adres] adresindeki taşınmazı [tarih] tarihli kira sözleşmesi ile kiralamış bulunmaktasınız. Mevcut kira bedeli [miktar] TL'dir.

6098 sayılı Türk Borçlar Kanunu'nun 344. maddesi gereğince, yeni kira döneminde kira bedelinin bir önceki kira yılında üretici fiyat endeksindeki artış oranını geçmemek koşuluyla, [yeni miktar] TL olarak belirlenmesini talep ediyorum.

İşbu ihtarnamenin tebliğinden itibaren yeni kira bedeli geçerli olacaktır.

Bilgi ve gereğini rica ederim.

Tarih: [Tarih]
İmza: [Ad Soyad]`,
    requiredDocs: ["Kira sözleşmesi fotokopisi", "Kimlik fotokopisi"],
    whereToSubmit: "Noter aracılığıyla kiracıya tebliğ",
    cost: "Noter ücreti: ~200-400 TL",
  },
  {
    id: "ihtar_ise_iade",
    title: "İşe İade Başvurusu",
    category: "İş Hukuku",
    emoji: "💼",
    description: "Haksız fesih durumunda arabuluculuk başvurusu için dilekçe.",
    difficulty: "orta",
    steps: [
      "Fesih bildiriminin tebliğinden itibaren 1 AY içinde başvurun",
      "Arabuluculuk bürosuna dilekçeyi verin",
      "Arabuluculuk görüşmesine katılın",
      "Anlaşma olmazsa 2 hafta içinde dava açın",
    ],
    template: `ARABULUCULUK BAŞVURU DİLEKÇESİ

[İl] ARABULUCULUK BÜROSU'NA

BAŞVURAN: [Ad Soyad]
TC Kimlik No: [TC]
Adres: [Adres]
Telefon: [Telefon]

KARŞI TARAF: [İşveren Ünvanı]
Adres: [İşyeri Adresi]

KONU: İşe iade talebi

AÇIKLAMALAR:
1. [Başlangıç tarihi] tarihinden itibaren davalı işyerinde [pozisyon] olarak çalışmaktaydım.
2. İş sözleşmem [fesih tarihi] tarihinde [fesih sebebi] gerekçesiyle feshedilmiştir.
3. Feshin geçerli bir nedene dayanmadığını düşünmekteyim.
4. 4857 sayılı İş Kanunu'nun 20. maddesi gereğince işe iade talep ediyorum.

TALEP: İş sözleşmemin feshinin geçersizliğinin tespiti ile işe iademe karar verilmesini talep ederim.

Tarih: [Tarih]
İmza: [Ad Soyad]`,
    requiredDocs: ["İş sözleşmesi", "Fesih bildirimi", "Son 3 aylık maaş bordrosu", "SGK hizmet dökümü"],
    whereToSubmit: "İl Arabuluculuk Bürosu",
    deadline: "Fesihten itibaren 1 ay",
    cost: "Arabuluculuk ücretsiz",
  },
  {
    id: "tuketici_sikayet",
    title: "Tüketici Şikâyet Dilekçesi",
    category: "Tüketici Hukuku",
    emoji: "🛒",
    description: "Ayıplı mal/hizmet için Tüketici Hakem Heyeti başvurusu.",
    difficulty: "kolay",
    steps: [
      "e-Devlet üzerinden veya elden başvuru yapın",
      "Tüm belgeleri ekleyin",
      "Hakem heyeti kararını bekleyin (ortalama 3-6 ay)",
    ],
    template: `TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞINA

ŞİKAYET EDEN: [Ad Soyad]
TC: [TC Kimlik No]
Adres: [Adres]
Telefon: [Telefon]

ŞİKAYET EDİLEN: [Firma Ünvanı]
Adres: [Firma Adresi]

ŞİKAYET KONUSU: Ayıplı mal/hizmet

AÇIKLAMALAR:
[Tarih] tarihinde [firma adı]'ndan [ürün/hizmet] satın aldım. [Sorunun açıklaması].

6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 11. maddesi gereğince [ücretsiz onarım / yenisi ile değişim / bedel iadesi] talep ediyorum.

EKLER:
1. Fatura/fiş fotokopisi
2. Ürün fotoğrafları
3. Satıcı ile yazışmalar

Tarih: [Tarih]
İmza: [Ad Soyad]`,
    requiredDocs: ["Fatura veya fiş", "Ürün fotoğrafları", "Satıcı ile yazışmalar (varsa)"],
    whereToSubmit: "İlçe Tüketici Hakem Heyeti veya e-Devlet",
    deadline: "2 yıl (ayıplı mal)",
    cost: "Ücretsiz",
  },
  {
    id: "bosanma_dilekce",
    title: "Anlaşmalı Boşanma Dilekçesi",
    category: "Aile Hukuku",
    emoji: "👨‍👩‍👧",
    description: "Eşlerin anlaşarak boşanma başvurusu.",
    difficulty: "zor",
    steps: [
      "Anlaşmalı boşanma protokolü hazırlayın",
      "Her iki eş de protokolü imzalasın",
      "Aile mahkemesine başvurun",
      "Duruşmaya birlikte katılın",
    ],
    template: `[İL] NÖBETÇİ AİLE MAHKEMESİ'NE

DAVACI: [Ad Soyad] - TC: [TC]
DAVALI: [Eş Ad Soyad] - TC: [TC]

KONU: Anlaşmalı boşanma

AÇIKLAMALAR:
1. Davalı ile [evlilik tarihi] tarihinde evlendik.
2. Evliliğimiz fiilen [ayrılık tarihi] tarihinden beri sona ermiş bulunmaktadır.
3. En az 1 yıllık evlilik süremiz dolmuştur.
4. Boşanma konusunda ve fer'i sonuçları konusunda anlaşmış bulunmaktayız.

Ekte sunulan anlaşmalı boşanma protokolü çerçevesinde boşanmamıza karar verilmesini arz ve talep ederiz.

EK: Anlaşmalı Boşanma Protokolü

Tarih: [Tarih]
Davacı İmza / Davalı İmza`,
    requiredDocs: ["Nüfus cüzdanı fotokopileri", "Evlilik cüzdanı", "Anlaşmalı boşanma protokolü", "Vekaletname (avukat ile gidiliyorsa)"],
    whereToSubmit: "Aile Mahkemesi",
    cost: "Harç: ~1.500-2.500 TL",
  },
  {
    id: "icra_itiraz",
    title: "İcra Takibine İtiraz",
    category: "İcra Hukuku",
    emoji: "⚠️",
    description: "Haksız icra takibine 7 gün içinde itiraz dilekçesi.",
    difficulty: "orta",
    steps: [
      "Ödeme emrinin tebliğinden itibaren 7 GÜN içinde itiraz edin",
      "İcra dairesine dilekçeyi verin",
      "İtiraz ile takip durur",
    ],
    template: `[İL] İCRA DAİRESİ'NE

DOSYA NO: [Dosya No]

BORÇLU: [Ad Soyad]
TC: [TC]

KONU: Ödeme emrine itiraz

Yukarıda esas numarası yazılı dosyadan tarafıma gönderilen ödeme emrine süresi içinde itiraz ediyorum.

İTİRAZ SEBEPLERİ:
1. Borcun tamamına itiraz ediyorum.
2. [Borcun neden haksız olduğunu açıklayın]
3. Alacaklıya herhangi bir borcum bulunmamaktadır.

Takibin durdurulmasını talep ederim.

Tarih: [Tarih]
İmza: [Ad Soyad]`,
    requiredDocs: ["Ödeme emri fotokopisi", "Kimlik fotokopisi", "Varsa ödeme belgeleri"],
    whereToSubmit: "İcra Dairesi",
    deadline: "Tebliğden itibaren 7 gün!",
    cost: "Ücretsiz",
  },
  {
    id: "kidem_ihtar",
    title: "Kıdem Tazminatı İhtarname",
    category: "İş Hukuku",
    emoji: "💰",
    description: "Ödenmeyen kıdem tazminatı için işverene ihtarname.",
    difficulty: "kolay",
    steps: [
      "Şablonu doldurun",
      "Noter aracılığıyla işverene gönderin",
      "14 gün bekleyin",
      "Ödenmezse arabuluculuğa başvurun",
    ],
    template: `İHTARNAME

İHTAR EDEN: [Ad Soyad]
TC: [TC]

MUHATAP: [İşveren Ünvanı]
Adres: [İşveri Adresi]

KONU: Kıdem ve ihbar tazminatının ödenmesi talebi

Müvekkilim/Ben [başlangıç tarihi] - [bitiş tarihi] tarihleri arasında işyerinizde [pozisyon] olarak çalışmış olup, iş sözleşmem [fesih şekli] şeklinde sona ermiştir.

4857 sayılı İş Kanunu gereğince hak kazandığım kıdem tazminatı ve ihbar tazminatının işbu ihtarnamenin tebliğinden itibaren 7 gün içinde aşağıdaki hesap numarasına ödenmesini, aksi halde yasal yollara başvuracağımı ihtar ederim.

IBAN: [IBAN]

Tarih: [Tarih]
İmza: [Ad Soyad]`,
    requiredDocs: ["İş sözleşmesi", "SGK çıkış belgesi", "Son maaş bordrosu"],
    whereToSubmit: "Noter aracılığıyla işverene",
    cost: "Noter ücreti: ~200-400 TL",
  },
];

export function getTemplatesByCategory(category?: string): DocumentTemplate[] {
  if (!category) return DOCUMENT_TEMPLATES;
  return DOCUMENT_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.id === id);
}
