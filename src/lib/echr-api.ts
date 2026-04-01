/**
 * AİHM (ECHR) HUDOC API Entegrasyonu
 * Türkiye aleyhine kararları arar
 * Kaynak: hudoc.echr.coe.int (undocumented JSON API)
 */

export interface ECHRCase {
  itemid: string;
  docname: string;
  appno: string;
  judgmentdate: string;
  importance: string;
  conclusion: string;
  violation: string[];
  nonviolation: string[];
  article: string[];
  respondent: string;
  extractedappno: string;
}

export interface ECHRSearchResult {
  cases: ECHRCase[];
  totalCount: number;
  success: boolean;
  error?: string;
}

const HUDOC_API = "https://hudoc.echr.coe.int/app/query/results";

export async function searchECHRCases(
  keyword: string,
  maxResults: number = 5
): Promise<ECHRSearchResult> {
  try {
    const query = `contentsitename:ECHR AND (NOT (doctype:PR OR doctype:HFCOMOLD OR doctype:HECOMOLD)) AND ((respondent:"TUR")) AND ("${keyword}")`;
    const select = "itemid,appno,docname,judgmentdate,importance,conclusion,violation,nonviolation,article,respondent,extractedappno";

    const url = `${HUDOC_API}?query=${encodeURIComponent(query)}&select=${select}&sort=judgmentdate%20Descending&start=0&length=${maxResults}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { cases: [], totalCount: 0, success: false, error: `HUDOC HTTP ${response.status}` };
    }

    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      const cases: ECHRCase[] = data.results.map((r: Record<string, unknown>) => {
        const cols = r.columns as Record<string, unknown> || r;
        return {
          itemid: (cols.itemid as string) || "",
          docname: (cols.docname as string) || "",
          appno: (cols.appno as string) || (cols.extractedappno as string) || "",
          judgmentdate: (cols.judgmentdate as string) || "",
          importance: (cols.importance as string) || "",
          conclusion: (cols.conclusion as string) || "",
          violation: Array.isArray(cols.violation) ? cols.violation : [],
          nonviolation: Array.isArray(cols.nonviolation) ? cols.nonviolation : [],
          article: Array.isArray(cols.article) ? cols.article : [],
          respondent: (cols.respondent as string) || "TUR",
          extractedappno: (cols.extractedappno as string) || "",
        };
      });

      return {
        cases,
        totalCount: (data.resultcount as number) || cases.length,
        success: true,
      };
    }

    return { cases: [], totalCount: 0, success: false, error: "HUDOC yanıt formatı beklenmiyor" };
  } catch (error) {
    return {
      cases: [],
      totalCount: 0,
      success: false,
      error: `HUDOC bağlantı hatası: ${error instanceof Error ? error.message : "Bilinmeyen"}`,
    };
  }
}

/**
 * Kategori bazlı AİHM arama terimleri
 */
export function getECHRKeywords(category: string): string {
  const keywords: Record<string, string> = {
    is_hukuku: "forced labour OR right to work",
    aile_hukuku: "family life OR child custody OR divorce",
    ceza_hukuku: "fair trial OR criminal charge OR detention",
    tuketici_hukuku: "property OR consumer",
    kira_hukuku: "property OR home OR housing",
    miras_hukuku: "inheritance OR property",
    idare_hukuku: "administrative OR public authority",
    ticaret_hukuku: "commercial OR company",
    icra_iflas: "enforcement OR execution",
  };
  return keywords[category] || "Turkey";
}
