/**
 * UYAP Emsal Karar Arama Servisi
 * https://emsal.uyap.gov.tr - T.C. Yargıtay / Bölge Adliye Mahkemeleri Emsal Karar Arama
 *
 * Bu servis, UYAP'ın açık erişimli emsal karar arama sistemine
 * server-side istekler göndererek gerçek mahkeme kararlarını çeker.
 */

export interface UyapSearchParams {
  aranacakKelime: string;
  bapiYrgpiTuru?: "Yargıtay" | "Bölge Adliye Mahkemesi" | "";
  birimDizi?: string;
  baslangicTarihi?: string; // DD/MM/YYYY
  bitisTarihi?: string;     // DD/MM/YYYY
  pageSize?: number;
  pageNumber?: number;
}

export interface UyapDecision {
  karar_id: string;
  mahkeme: string;
  esas_no: string;
  karar_no: string;
  karar_tarihi: string;
  ozet: string;
  metin: string;
  karar_turu: string;
}

export interface UyapSearchResult {
  decisions: UyapDecision[];
  totalCount: number;
  success: boolean;
  error?: string;
}

const UYAP_BASE_URL = "https://emsal.uyap.gov.tr";

const UYAP_ENDPOINTS = {
  search: `${UYAP_BASE_URL}/aramadetay`,
  detail: `${UYAP_BASE_URL}/getDokuman`,
  yargitay: `${UYAP_BASE_URL}/aramayap`,
};

/**
 * UYAP Emsal karar arama
 * Server-side'dan çağrılmalıdır (API route içinden)
 */
export async function searchUyapPrecedents(
  params: UyapSearchParams
): Promise<UyapSearchResult> {
  try {
    const searchBody = {
      apiTuru: params.bapiYrgpiTuru || "",
      aranacakKelime: params.aranacakKelime,
      birimDizi: params.birimDizi || "",
      bapiYrgpiTuru: params.bapiYrgpiTuru || "",
      baslangicTarihi: params.baslangicTarihi || "",
      bitisTarihi: params.bitisTarihi || "",
      pageSize: params.pageSize || 10,
      pageNumber: params.pageNumber || 1,
    };

    const response = await fetch(UYAP_ENDPOINTS.search, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": UYAP_BASE_URL,
        "Referer": `${UYAP_BASE_URL}/`,
      },
      body: JSON.stringify(searchBody),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      // Fallback: HTML form-based search
      return await searchUyapFallback(params);
    }

    const data = await response.json();

    if (data && Array.isArray(data.data)) {
      const decisions: UyapDecision[] = data.data.map((item: Record<string, string>) => ({
        karar_id: item.id || item.kararId || "",
        mahkeme: item.birim || item.mahkeme || item.daire || "",
        esas_no: item.esasNo || item.piEsasNo || "",
        karar_no: item.kararNo || item.piKararNo || "",
        karar_tarihi: item.kararTarihi || item.piKararTarihi || "",
        ozet: item.ozet || item.kararOzeti || "",
        metin: item.kararMetni || item.metin || "",
        karar_turu: item.kararTuru || "",
      }));

      return {
        decisions,
        totalCount: data.toplamSayfa || data.totalCount || decisions.length,
        success: true,
      };
    }

    // If response format is different, try parsing differently
    if (data && data.resultList) {
      const decisions: UyapDecision[] = data.resultList.map((item: Record<string, string>) => ({
        karar_id: item.id || "",
        mahkeme: item.mahkemeAdi || item.birimAdi || "",
        esas_no: item.esasNo || "",
        karar_no: item.kararNo || "",
        karar_tarihi: item.kararTarihi || "",
        ozet: item.kararOzeti || item.ozet || "",
        metin: item.kararMetni || "",
        karar_turu: item.kararTuru || "",
      }));

      return {
        decisions,
        totalCount: data.totalCount || decisions.length,
        success: true,
      };
    }

    return await searchUyapFallback(params);
  } catch (error) {
    console.error("UYAP API error:", error);
    return await searchUyapFallback(params);
  }
}

/**
 * Fallback: HTML form tabanlı arama
 */
async function searchUyapFallback(
  params: UyapSearchParams
): Promise<UyapSearchResult> {
  try {
    const formData = new URLSearchParams();
    formData.append("aranacakKelime", params.aranacakKelime);
    if (params.baslangicTarihi) formData.append("baslangicTarihi", params.baslangicTarihi);
    if (params.bitisTarihi) formData.append("bitisTarihi", params.bitisTarihi);

    const response = await fetch(`${UYAP_BASE_URL}/aramayap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Origin": UYAP_BASE_URL,
        "Referer": `${UYAP_BASE_URL}/`,
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return {
        decisions: [],
        totalCount: 0,
        success: false,
        error: `UYAP erişim hatası: HTTP ${response.status}. UYAP sunucusu yanıt vermedi.`,
      };
    }

    const html = await response.text();
    const decisions = parseUyapHtml(html);

    return {
      decisions,
      totalCount: decisions.length,
      success: decisions.length > 0,
      error: decisions.length === 0 ? "UYAP'tan sonuç ayrıştırılamadı." : undefined,
    };
  } catch (error) {
    return {
      decisions: [],
      totalCount: 0,
      success: false,
      error: `UYAP bağlantı hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}. Yerel emsal veritabanı kullanılacak.`,
    };
  }
}

/**
 * UYAP HTML yanıtından karar bilgilerini ayrıştır
 */
function parseUyapHtml(html: string): UyapDecision[] {
  const decisions: UyapDecision[] = [];

  // Pattern 1: Table rows with case data
  const rowRegex = /<tr[^>]*class="[^"]*karar[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1];
    const cells = extractCells(row);
    if (cells.length >= 4) {
      decisions.push({
        karar_id: `uyap_${decisions.length + 1}`,
        mahkeme: cleanHtml(cells[0] || ""),
        esas_no: cleanHtml(cells[1] || ""),
        karar_no: cleanHtml(cells[2] || ""),
        karar_tarihi: cleanHtml(cells[3] || ""),
        ozet: cleanHtml(cells[4] || ""),
        metin: "",
        karar_turu: "",
      });
    }
  }

  // Pattern 2: Div-based card layout
  if (decisions.length === 0) {
    const cardRegex = /<div[^>]*class="[^"]*card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    let cardMatch;
    while ((cardMatch = cardRegex.exec(html)) !== null) {
      const card = cardMatch[1];
      const mahkeme = extractByPattern(card, /(?:mahkeme|daire|birim)[^:]*:\s*([^<]+)/i);
      const esasNo = extractByPattern(card, /(?:esas)[^:]*:\s*([^<]+)/i);
      const kararNo = extractByPattern(card, /(?:karar\s*no)[^:]*:\s*([^<]+)/i);
      const tarih = extractByPattern(card, /(?:tarih)[^:]*:\s*([^<]+)/i);
      const ozet = extractByPattern(card, /(?:özet|ozet|karar)[^:]*:\s*([^<]+)/i);

      if (mahkeme || esasNo) {
        decisions.push({
          karar_id: `uyap_${decisions.length + 1}`,
          mahkeme: mahkeme || "Belirtilmemiş",
          esas_no: esasNo || "",
          karar_no: kararNo || "",
          karar_tarihi: tarih || "",
          ozet: ozet || "",
          metin: "",
          karar_turu: "",
        });
      }
    }
  }

  // Pattern 3: Generic table extraction
  if (decisions.length === 0) {
    const tableRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let tableMatch;
    let isHeader = true;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      if (isHeader) { isHeader = false; continue; }
      const cells = extractCells(tableMatch[1]);
      if (cells.length >= 3) {
        decisions.push({
          karar_id: `uyap_${decisions.length + 1}`,
          mahkeme: cleanHtml(cells[0] || ""),
          esas_no: cleanHtml(cells[1] || ""),
          karar_no: cleanHtml(cells[2] || ""),
          karar_tarihi: cleanHtml(cells[3] || ""),
          ozet: cleanHtml(cells.slice(4).join(" ") || ""),
          metin: "",
          karar_turu: "",
        });
      }
    }
  }

  return decisions;
}

function extractCells(rowHtml: string): string[] {
  const cells: string[] = [];
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let cellMatch;
  while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
    cells.push(cellMatch[1]);
  }
  return cells;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractByPattern(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match ? cleanHtml(match[1]) : "";
}

/**
 * Kategori bazlı anahtar kelimeleri oluştur
 */
export function getCategoryKeywords(category: string): string[] {
  const categoryKeywords: Record<string, string[]> = {
    is_hukuku: ["işçi alacağı", "kıdem tazminatı", "ihbar tazminatı", "işe iade", "haklı fesih", "fazla mesai"],
    aile_hukuku: ["boşanma", "nafaka", "velayet", "tazminat", "mal rejimi", "ziynet eşyası"],
    ticaret_hukuku: ["haksız rekabet", "ticari dava", "şirket", "iflas", "konkordato"],
    ceza_hukuku: ["hakaret", "tehdit", "dolandırıcılık", "hırsızlık", "yaralama", "TCK"],
    tuketici_hukuku: ["ayıplı mal", "tüketici", "cayma hakkı", "garanti", "iade"],
    kira_hukuku: ["kira tespit", "tahliye", "kira alacağı", "kiracı", "fuzuli işgal"],
    miras_hukuku: ["miras", "tenkis", "vasiyetname", "saklı pay", "mirasçı"],
    idare_hukuku: ["idari işlem", "iptal davası", "tam yargı", "disiplin cezası"],
    icra_iflas: ["itirazın iptali", "icra", "iflas", "haciz", "istihkak"],
  };
  return categoryKeywords[category] || ["dava", "karar"];
}
