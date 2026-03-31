export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  content: string;
  keywords: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "isten-cikarilma-haklari",
    title: "İşten Çıkarılma Hakları: 2026 Güncel Rehber",
    description: "İşten haksız yere çıkarıldıysanız ne yapmalısınız? Kıdem tazminatı, ihbar tazminatı, işe iade davası ve tüm haklarınız.",
    category: "İş Hukuku",
    readTime: "8 dk",
    date: "2026-03-15",
    keywords: ["işten çıkarılma", "kıdem tazminatı", "ihbar tazminatı", "işe iade", "işçi hakları"],
    content: `## İşten Çıkarılınca Ne Yapmalısınız?

İşten çıkarılmak stresli bir süreçtir, ancak Türk iş hukuku işçilere güçlü koruma sağlar. Bu rehberde tüm haklarınızı öğreneceksiniz.

## 1. Kıdem Tazminatı

**En az 1 yıl** çalıştıysanız kıdem tazminatı hakkınız vardır. Her çalışılan yıl için **1 aylık brüt maaş** tutarında ödenir.

**Örnek:** 5 yıl çalıştınız, brüt maaşınız 30.000 TL → 150.000 TL kıdem tazminatı

**Kimler alabilir?**
- İşveren tarafından çıkarılanlar (haklı fesih hariç)
- Askerlik, evlilik nedeniyle ayrılanlar
- Emeklilik hakkı kazananlar
- Sağlık nedeniyle ayrılanlar

## 2. İhbar Tazminatı

İşveren sizi **önceden haber vermeden** çıkardıysa ihbar tazminatı ödemek zorundadır:

| Çalışma Süresi | İhbar Süresi |
|---|---|
| 0-6 ay | 2 hafta |
| 6 ay - 1.5 yıl | 4 hafta |
| 1.5 - 3 yıl | 6 hafta |
| 3+ yıl | 8 hafta |

## 3. İşe İade Davası

30+ işçi çalışan işyerinde, 6+ ay kıdeminiz varsa ve **geçerli bir neden gösterilmeden** çıkarıldıysanız işe iade davası açabilirsiniz.

**DİKKAT:** Fesih bildiriminden itibaren **1 ay** içinde arabulucuya başvurmanız gerekir!

## 4. Fazla Mesai Ücreti

Haftada 45 saatten fazla çalıştıysanız, son 5 yılın fazla mesai ücretini talep edebilirsiniz.

## Ne Yapmalısınız?

1. **İş sözleşmenizi** ve **maaş bordrolarınızı** saklayın
2. **Fesih bildirimi**ni yazılı olarak isteyin
3. **1 ay içinde** arabulucuya başvurun (işe iade için)
4. **5 yıl içinde** kıdem/ihbar tazminatı davası açabilirsiniz
5. Bir **iş hukuku avukatına** danışın

> JusticeGuard ile davanızın kazanma ihtimalini ücretsiz analiz edin.`,
  },
  {
    slug: "bosanma-davasi-rehberi",
    title: "Boşanma Davası Nasıl Açılır? Süreç ve Maliyetler",
    description: "Anlaşmalı ve çekişmeli boşanma farkları, nafaka, velayet, mal paylaşımı. Boşanma sürecinde bilmeniz gereken her şey.",
    category: "Aile Hukuku",
    readTime: "10 dk",
    date: "2026-03-10",
    keywords: ["boşanma davası", "nafaka", "velayet", "mal paylaşımı", "anlaşmalı boşanma"],
    content: `## Boşanma Davası Rehberi

## 1. Anlaşmalı Boşanma

Eşler tüm konularda (nafaka, velayet, mal paylaşımı) anlaşırsa:
- **Süre:** 1-4 hafta
- **Koşul:** En az 1 yıl evli olmak
- **Maliyet:** 5.000-15.000 TL (avukat ücreti)

## 2. Çekişmeli Boşanma

Anlaşma sağlanamazsa:
- **Süre:** Ortalama 156 gün (Adalet Bakanlığı 2024)
- **İstinaf:** +8 ay, Yargıtay: +8 ay
- **Maliyet:** 15.000-50.000 TL

## 3. Boşanma Sebepleri

- Aldatma (zina)
- Terk (en az 6 ay)
- Şiddet / onur kırıcı davranış
- Suç işleme
- Geçimsizlik (evlilik birliğinin temelinden sarsılması)

## 4. Nafaka Türleri

- **Tedbir nafakası:** Dava süresince
- **Yoksulluk nafakası:** Boşanma sonrası, süresiz
- **İştirak nafakası:** Çocuk için

## 5. Velayet

Mahkeme **çocuğun üstün yararını** esas alır. Sosyal inceleme raporu istenir.

## 6. Mal Paylaşımı

2002 sonrası evliliklerde **edinilmiş mallara katılma rejimi** geçerlidir. Evlilik süresince edinilen mallar eşit paylaşılır.

> Boşanma davanızın olası sonuçlarını JusticeGuard ile analiz edin.`,
  },
  {
    slug: "kira-artisi-ve-kiracinin-haklari",
    title: "Kira Artışı 2026: Kiracının Hakları ve Sınırlar",
    description: "Kira artış oranı nasıl hesaplanır? Ev sahibi ne kadar artış yapabilir? Kiracının hakları nelerdir?",
    category: "Kira Hukuku",
    readTime: "6 dk",
    date: "2026-03-05",
    keywords: ["kira artışı", "kiracı hakları", "kira sözleşmesi", "tahliye", "kira tespit"],
    content: `## 2026 Kira Artışı Rehberi

## Yasal Kira Artış Sınırı

Konut kiralarında artış oranı **TÜFE (12 aylık ortalama)** ile sınırlıdır.

## Ev Sahibi Ne Yapabilir?

- Yıllık TÜFE oranında artış isteyebilir
- 5 yıl sonunda kira tespit davası açabilir
- İhtiyaç nedeniyle tahliye isteyebilir (kira bitiminde)
- 10 yıl sonunda sebepsiz tahliye isteyebilir

## Kiracının Hakları

- TÜFE üstü artış **geçersizdir**
- Sözleşme süresi bitmeden tahliye edilemez
- Depozito en fazla 3 aylık kira olabilir
- Tadilat/tamir masrafları ev sahibine aittir

## Kira Tespit Davası

5+ yıldır aynı dairede oturuyorsanız, ev sahibi **emsal kiralara** göre artış isteyebilir. Mahkeme bilirkişi raporu ile yeni kirayı belirler.

## Tahliye Davası Süreleri

- İhtiyaç tahliyesi: Kira bitiş tarihinden 1 ay içinde
- Borç tahliyesi: 2 haklı ihtar veya 30 gün süre
- 10 yıl tahliye: Her zaman açılabilir

> Kira uyuşmazlığınızı JusticeGuard ile analiz edin.`,
  },
  {
    slug: "tuketici-haklari-ayipli-mal",
    title: "Tüketici Hakları: Ayıplı Mal İadesi ve Cayma Hakkı",
    description: "Aldığınız ürün bozuk çıktı mı? İnternetten aldığınız ürünü iade etmek mi istiyorsunuz? Tüm haklarınız burada.",
    category: "Tüketici Hukuku",
    readTime: "5 dk",
    date: "2026-02-28",
    keywords: ["tüketici hakları", "ayıplı mal", "cayma hakkı", "iade", "garanti"],
    content: `## Tüketici Hakları Rehberi

## 1. Ayıplı Mal

Satın aldığınız üründe kusur varsa 4 seçeneğiniz var:
1. **Ücretsiz onarım** isteme
2. **Ürün değişimi** isteme
3. **İndirim** isteme
4. **İade ve para iadesi** isteme

**Süreler:**
- Açık ayıp: Teslimden itibaren **6 ay**
- Gizli ayıp: Teslimden itibaren **2 yıl**

## 2. Cayma Hakkı (İnternet Alışverişi)

Online alışverişlerde **14 gün** içinde sebep göstermeden iade edebilirsiniz.

**Geçerli olmayan durumlar:**
- Kişiye özel üretilen ürünler
- Açılmış kozmetik ürünleri
- Dijital içerikler (indirildikten sonra)

## 3. Garanti

- Üretici garantisi: En az **2 yıl**
- Garanti süresinde arızalarda onarım ücretsiz
- 1 yıl içinde aynı arıza 2+ kez → değişim hakkı

## 4. Tüketici Hakem Heyeti

66.000 TL altı uyuşmazlıklarda hakem heyetine başvurabilirsiniz. **Ücretsizdir.**

> Tüketici hakkınızı JusticeGuard ile analiz edin.`,
  },
  {
    slug: "sosyal-medyada-hakaret-dava",
    title: "Sosyal Medyada Hakaret: Dava Açabilir miyim?",
    description: "Instagram, Twitter, TikTok'ta hakaret eden kişiye karşı hukuki haklarınız. Şikayet süreci ve cezalar.",
    category: "Ceza Hukuku",
    readTime: "5 dk",
    date: "2026-02-20",
    keywords: ["sosyal medya hakaret", "online hakaret", "siber suç", "şikayet", "ceza davası"],
    content: `## Sosyal Medyada Hakaret

## Hakaret Suçu (TCK m.125)

Sosyal medyada hakaret **aleniyet** unsuru taşıdığından cezası daha ağırdır.

**Ceza:** 1 yıla kadar hapis veya adli para cezası (aleniyet: 1/6 artırım)

## Ne Yapmalısınız?

1. **Ekran görüntüsü** alın (tarih ve saat görünmeli)
2. **Noter** üzerinden tespit yaptırın (güçlü delil)
3. **6 ay** içinde savcılığa şikayette bulunun
4. Maddi/manevi **tazminat davası** açın

## Hangi Paylaşımlar Hakaret Sayılır?

- Küfür ve aşağılayıcı sözler
- Kişiliğe yönelik saldırılar
- Nefret söylemi
- Özel hayatı ifşa etme

## Hangileri Hakaret Sayılmaz?

- Eleştiri (ağır olmadıkça)
- Haber verme amaçlı paylaşımlar
- Kamusal tartışma

> Hakaret davanızın gücünü JusticeGuard ile ölçün.`,
  },
  {
    slug: "miras-paylasimi-rehberi",
    title: "Miras Paylaşımı: Kim Ne Kadar Alır?",
    description: "Yasal mirasçılar, saklı pay, vasiyetname, tenkis davası. Miras hukukunda bilmeniz gereken her şey.",
    category: "Miras Hukuku",
    readTime: "7 dk",
    date: "2026-02-15",
    keywords: ["miras paylaşımı", "mirasçı", "saklı pay", "vasiyetname", "tenkis davası"],
    content: `## Miras Paylaşımı Rehberi

## Yasal Mirasçılar

**1. Derece:** Çocuklar (eşit paylaşım)
**Eş:** Çocuklarla birlikte 1/4, ana-baba ile 1/2, tek başına tamamı

## Saklı Pay Oranları

- Çocuklar: Yasal payın **1/2**'si
- Ana-baba: Yasal payın **1/4**'ü
- Eş: Yasal payın **tamamı** (alt soy ile) veya **3/4** (ana-baba ile)

## Vasiyetname

Miras bırakan, saklı payları aşmamak kaydıyla mallarını istediği gibi bırakabilir.

## Tenkis Davası

Saklı payınız ihlal edildiyse:
- Ölümden itibaren **1 yıl** (öğrenmeden)
- Ölümden itibaren **10 yıl** (her halde)

## Mirasın Reddi

Borçlar mallardan fazlaysa mirası **3 ay** içinde reddedebilirsiniz.

> Miras payınızı JusticeGuard ile analiz edin.`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
