/**
 * Mevzuat Bilgi Sistemi Entegrasyonu
 * Kaynak: mevzuat.gov.tr
 * Tüm yürürlükteki kanunlar, KHK'lar, yönetmelikler
 */

const MEVZUAT_BASE = "https://www.mevzuat.gov.tr";

export interface MevzuatResult {
  mevzuatNo: string;
  mevzuatTur: string;
  mevzuatAd: string;
  kabulTarihi?: string;
  resmiGazeteTarihi?: string;
  madde?: string;
  icerik?: string;
  url: string;
}

// Temel kanun kodları - hızlı erişim
export const TEMEL_KANUNLAR: Record<string, { ad: string; no: string; kisaAd: string }> = {
  "anayasa": { ad: "Türkiye Cumhuriyeti Anayasası", no: "2709", kisaAd: "Anayasa" },
  "tmk": { ad: "Türk Medeni Kanunu", no: "4721", kisaAd: "TMK" },
  "tbk": { ad: "Türk Borçlar Kanunu", no: "6098", kisaAd: "TBK" },
  "ttk": { ad: "Türk Ticaret Kanunu", no: "6102", kisaAd: "TTK" },
  "tck": { ad: "Türk Ceza Kanunu", no: "5237", kisaAd: "TCK" },
  "cmk": { ad: "Ceza Muhakemesi Kanunu", no: "5271", kisaAd: "CMK" },
  "hmk": { ad: "Hukuk Muhakemeleri Kanunu", no: "6100", kisaAd: "HMK" },
  "iik": { ad: "İcra ve İflas Kanunu", no: "2004", kisaAd: "İİK" },
  "is_kanunu": { ad: "İş Kanunu", no: "4857", kisaAd: "İK" },
  "kvkk": { ad: "Kişisel Verilerin Korunması Kanunu", no: "6698", kisaAd: "KVKK" },
  "tuketici": { ad: "Tüketicinin Korunması Hakkında Kanun", no: "6502", kisaAd: "TKHK" },
  "avukatlik": { ad: "Avukatlık Kanunu", no: "1136", kisaAd: "AvK" },
  "idari_yargilama": { ad: "İdari Yargılama Usulü Kanunu", no: "2577", kisaAd: "İYUK" },
  "kabahatler": { ad: "Kabahatler Kanunu", no: "5326", kisaAd: "KabK" },
  "tebligat": { ad: "Tebligat Kanunu", no: "7201", kisaAd: "TebK" },
  "harclar": { ad: "Harçlar Kanunu", no: "492", kisaAd: "HK" },
  "aile_mahkemeleri": { ad: "Aile Mahkemelerinin Kuruluş Kanunu", no: "4787", kisaAd: "AMK" },
  "arabuluculuk": { ad: "Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu", no: "6325", kisaAd: "HUAK" },
  "miras": { ad: "Türk Medeni Kanunu (Miras)", no: "4721", kisaAd: "TMK" },
  "kira": { ad: "Türk Borçlar Kanunu (Kira)", no: "6098", kisaAd: "TBK" },
};

// Kategori → ilgili kanunlar eşleştirmesi
export const KATEGORI_KANUNLAR: Record<string, string[]> = {
  "is_hukuku": ["is_kanunu", "tbk", "arabuluculuk"],
  "aile_hukuku": ["tmk", "aile_mahkemeleri"],
  "ticaret_hukuku": ["ttk", "tbk", "arabuluculuk"],
  "ceza_hukuku": ["tck", "cmk"],
  "tuketici_hukuku": ["tuketici", "tbk"],
  "kira_hukuku": ["kira", "tbk", "tebligat"],
  "miras_hukuku": ["miras", "tmk"],
  "idare_hukuku": ["idari_yargilama", "anayasa"],
  "icra_iflas": ["iik", "harclar"],
};

/**
 * mevzuat.gov.tr'den kanun arama
 */
export async function searchMevzuat(query: string): Promise<MevzuatResult[]> {
  try {
    const response = await fetch(`${MEVZUAT_BASE}/anasayfa/MevzuatFihpiristArama?aranan=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Haklarim-Legal-App/1.0",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const html = await response.text();
    return parseMevzuatResults(html, query);
  } catch {
    return [];
  }
}

/**
 * Kanun numarasıyla doğrudan erişim
 */
export function getMevzuatUrl(kanunNo: string): string {
  return `${MEVZUAT_BASE}/MevzuatMetin/${kanunNo}.pdf`;
}

/**
 * Kategori için ilgili kanunları getir
 */
export function getRelatedLaws(category: string): { ad: string; no: string; kisaAd: string; url: string }[] {
  const kanunKeys = KATEGORI_KANUNLAR[category] || [];
  return kanunKeys
    .map((key) => TEMEL_KANUNLAR[key])
    .filter(Boolean)
    .map((k) => ({ ...k, url: `${MEVZUAT_BASE}/MevzuatMetin/${k.no}.pdf` }));
}

/**
 * Kanun maddesi referansı oluştur
 */
export function formatLawReference(kisaAd: string, madde: number): string {
  return `${kisaAd} md. ${madde}`;
}

// HTML parse helper
function parseMevzuatResults(html: string, query: string): MevzuatResult[] {
  const results: MevzuatResult[] = [];

  // Basit regex ile sonuç çıkarma
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows.slice(0, 10)) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length >= 2) {
      const text = cells.map((c) => c.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
      if (text.length >= 2 && text.some((t) => t.toLowerCase().includes(query.toLowerCase().slice(0, 10)))) {
        results.push({
          mevzuatNo: text[0] || "",
          mevzuatTur: "Kanun",
          mevzuatAd: text[1] || text[0] || "",
          url: MEVZUAT_BASE,
        });
      }
    }
  }

  return results;
}
