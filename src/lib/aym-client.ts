/**
 * Anayasa Mahkemesi Karar Arama
 * Kaynak: anayasa.gov.tr
 * Norm denetimi + bireysel başvuru kararları
 */

const AYM_BASE = "https://kararlarbilgibankasi.anayasa.gov.tr";

export interface AYMDecision {
  esasNo: string;
  kararNo: string;
  kararTarihi: string;
  basvuruTuru: "norm_denetimi" | "bireysel_basvuru" | "diger";
  konu: string;
  sonuc: string;
  ozet?: string;
  url: string;
}

/**
 * AYM karar arama
 */
export async function searchAYMDecisions(query: string): Promise<AYMDecision[]> {
  try {
    const response = await fetch(`${AYM_BASE}/api/kararlar?aranan=${encodeURIComponent(query)}&limit=10`, {
      headers: {
        "User-Agent": "Haklarim-Legal-App/1.0",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // API yoksa HTML scraping dene
      return await searchAYMFallback(query);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map(mapAYMDecision);
    }
    return [];
  } catch {
    return await searchAYMFallback(query);
  }
}

async function searchAYMFallback(query: string): Promise<AYMDecision[]> {
  try {
    const response = await fetch(`${AYM_BASE}/BB/Ara?aranan=${encodeURIComponent(query)}`, {
      headers: { "User-Agent": "Haklarim-Legal-App/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];
    const html = await response.text();
    return parseAYMHtml(html);
  } catch {
    return [];
  }
}

function parseAYMHtml(html: string): AYMDecision[] {
  const results: AYMDecision[] = [];
  const rows = html.match(/<tr[^>]*class="[^"]*karar[^"]*"[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows.slice(0, 5)) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    const texts = cells.map((c) => c.replace(/<[^>]+>/g, "").trim());
    if (texts.length >= 3) {
      results.push({
        esasNo: texts[0] || "",
        kararNo: texts[1] || "",
        kararTarihi: texts[2] || "",
        basvuruTuru: "bireysel_basvuru",
        konu: texts[3] || "",
        sonuc: texts[4] || "",
        url: AYM_BASE,
      });
    }
  }
  return results;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAYMDecision(raw: any): AYMDecision {
  return {
    esasNo: raw.esasNo || raw.esas_no || "",
    kararNo: raw.kararNo || raw.karar_no || "",
    kararTarihi: raw.kararTarihi || raw.karar_tarihi || "",
    basvuruTuru: raw.basvuruTuru || "diger",
    konu: raw.konu || "",
    sonuc: raw.sonuc || "",
    ozet: raw.ozet || "",
    url: raw.url || AYM_BASE,
  };
}
