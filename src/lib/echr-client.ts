/**
 * AİHM (Avrupa İnsan Hakları Mahkemesi) Karar Arama
 * Kaynak: hudoc.echr.coe.int
 * Türkiye aleyhine verilen kararlar
 */

const HUDOC_BASE = "https://hudoc.echr.coe.int/app/query/results";

export interface ECHRDecision {
  itemid: string;
  docname: string;
  appno: string;
  respondent: string;
  date: string;
  conclusion: string;
  importance: string;
  articles: string[];
  url: string;
}

/**
 * AİHM karar arama - Türkiye kararları
 */
export async function searchECHRDecisions(query: string): Promise<ECHRDecision[]> {
  try {
    const searchQuery = JSON.stringify({
      query: `contentsitename:ECHR AND (NOT (typedescription=PR)) AND ((respondent:"TUR") AND (${query}))`,
      select: "itemid,docname,appno,respondent,kpdate,conclusion,importance,article",
      sort: "kpdate Descending",
      start: 0,
      length: 10,
    });

    const response = await fetch(`${HUDOC_BASE}?query=${encodeURIComponent(searchQuery)}`, {
      headers: {
        "User-Agent": "Haklarim-Legal-App/1.0",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (data.results) {
      return data.results.map(mapECHRDecision).filter((d: ECHRDecision) => d.docname);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Makale numarasına göre AİHM kararları
 * Örn: "Article 6" (adil yargılanma), "Article 10" (ifade özgürlüğü)
 */
export async function searchByArticle(articleNo: number): Promise<ECHRDecision[]> {
  return searchECHRDecisions(`article:"${articleNo}"`);
}

// AİHS maddeleri - Türkçe referans
export const AIHS_MADDELERI: Record<number, string> = {
  2: "Yaşam Hakkı",
  3: "İşkence Yasağı",
  5: "Özgürlük ve Güvenlik Hakkı",
  6: "Adil Yargılanma Hakkı",
  8: "Özel ve Aile Hayatına Saygı Hakkı",
  9: "Düşünce, Vicdan ve Din Özgürlüğü",
  10: "İfade Özgürlüğü",
  11: "Toplantı ve Dernek Kurma Özgürlüğü",
  13: "Etkili Başvuru Hakkı",
  14: "Ayrımcılık Yasağı",
  34: "Bireysel Başvuru Hakkı",
  41: "Hakkaniyete Uygun Tazmin",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapECHRDecision(raw: any): ECHRDecision {
  return {
    itemid: raw.itemid || "",
    docname: raw.docname || "",
    appno: raw.appno || "",
    respondent: raw.respondent || "",
    date: raw.kpdate || "",
    conclusion: raw.conclusion || "",
    importance: raw.importance || "",
    articles: (raw.article || "").split(";").filter(Boolean),
    url: `https://hudoc.echr.coe.int/eng?i=${raw.itemid || ""}`,
  };
}
