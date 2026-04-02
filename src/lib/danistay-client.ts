/**
 * Danıştay Karar Arama
 * Kaynak: danistay.gov.tr
 * İdari yargı kararları
 */

const DANISTAY_BASE = "https://karararama.danistay.gov.tr";

export interface DanistayDecision {
  daire: string;
  esasNo: string;
  kararNo: string;
  kararTarihi: string;
  konu: string;
  ozet: string;
  sonuc: string;
  url: string;
}

/**
 * Danıştay karar arama
 */
export async function searchDanistayDecisions(query: string): Promise<DanistayDecision[]> {
  try {
    const response = await fetch(`${DANISTAY_BASE}/aramasonuc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Haklarim-Legal-App/1.0",
      },
      body: `aranan=${encodeURIComponent(query)}&pageSize=10`,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const html = await response.text();
    return parseDanistayResults(html);
  } catch {
    return [];
  }
}

function parseDanistayResults(html: string): DanistayDecision[] {
  const results: DanistayDecision[] = [];
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows.slice(0, 10)) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    const texts = cells.map((c) => c.replace(/<[^>]+>/g, "").trim());

    if (texts.length >= 4 && texts.some((t) => t.includes("/"))) {
      results.push({
        daire: texts[0] || "",
        esasNo: texts[1] || "",
        kararNo: texts[2] || "",
        kararTarihi: texts[3] || "",
        konu: texts[4] || "",
        ozet: texts[5] || "",
        sonuc: texts[6] || "",
        url: DANISTAY_BASE,
      });
    }
  }

  return results;
}
