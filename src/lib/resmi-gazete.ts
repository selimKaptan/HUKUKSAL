/**
 * Resmi Gazete Takip Sistemi
 * Kaynak: resmigazete.gov.tr
 * Yeni kanun değişikliklerini izler
 */

const RG_BASE = "https://www.resmigazete.gov.tr";

export interface GazetteEntry {
  tarih: string;
  sayi: string;
  baslik: string;
  tur: "kanun" | "khk" | "yonetmelik" | "teblig" | "karar" | "diger";
  url: string;
}

/**
 * Bugünkü Resmi Gazete içeriğini getir
 */
export async function getTodaysGazette(): Promise<GazetteEntry[]> {
  try {
    const today = new Date();
    const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;

    const response = await fetch(`${RG_BASE}/default.aspx`, {
      headers: {
        "User-Agent": "Haklarim-Legal-App/1.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const html = await response.text();
    return parseGazetteEntries(html, dateStr);
  } catch {
    return [];
  }
}

/**
 * Belirli tarihteki Resmi Gazete
 */
export async function getGazetteByDate(date: string): Promise<GazetteEntry[]> {
  try {
    const response = await fetch(`${RG_BASE}/eskiler/${date}.htm`, {
      headers: { "User-Agent": "Haklarim-Legal-App/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];
    const html = await response.text();
    return parseGazetteEntries(html, date);
  } catch {
    return [];
  }
}

/**
 * Hukuk alanıyla ilgili son değişiklikleri kontrol et
 */
export async function checkRecentLegalChanges(): Promise<{
  hasChanges: boolean;
  entries: GazetteEntry[];
  lastChecked: string;
}> {
  const entries = await getTodaysGazette();
  const legalEntries = entries.filter((e) =>
    e.tur === "kanun" || e.tur === "khk" || e.tur === "yonetmelik"
  );

  return {
    hasChanges: legalEntries.length > 0,
    entries: legalEntries,
    lastChecked: new Date().toISOString(),
  };
}

function parseGazetteEntries(html: string, date: string): GazetteEntry[] {
  const entries: GazetteEntry[] = [];

  // Sayı numarasını bul
  const sayiMatch = html.match(/Say[ıi]\s*:\s*(\d+)/);
  const sayi = sayiMatch ? sayiMatch[1] : "";

  // Link ve başlıkları bul
  const linkPattern = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();

    if (text.length < 10) continue;

    // Tür belirle
    let tur: GazetteEntry["tur"] = "diger";
    const textLower = text.toLowerCase();
    if (textLower.includes("kanun")) tur = "kanun";
    else if (textLower.includes("kararname") || textLower.includes("khk")) tur = "khk";
    else if (textLower.includes("yönetmelik")) tur = "yonetmelik";
    else if (textLower.includes("tebliğ")) tur = "teblig";
    else if (textLower.includes("karar")) tur = "karar";

    if (tur !== "diger") {
      entries.push({
        tarih: date,
        sayi,
        baslik: text.slice(0, 200),
        tur,
        url: href.startsWith("http") ? href : `${RG_BASE}/${href}`,
      });
    }
  }

  return entries.slice(0, 20);
}
