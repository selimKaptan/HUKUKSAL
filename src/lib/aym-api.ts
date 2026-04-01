/**
 * Anayasa Mahkemesi Kararlar Bilgi Bankası
 * Kaynak: kararlarbilgibankasi.anayasa.gov.tr
 * NOT: Resmi API yok, web arayüzünün arka plan endpoint'i kullanılıyor
 */

export interface AYMCase {
  baspikaNo: string;      // Başvuru numarası
  kararTarihi: string;    // Karar tarihi
  kararSonucu: string;    // İhlal/İhlal Yok
  haklar: string[];       // İhlal edilen haklar
  ozet: string;           // Karar özeti
  basvurucu: string;      // Başvurucu
}

export interface AYMSearchResult {
  cases: AYMCase[];
  totalCount: number;
  success: boolean;
  error?: string;
}

const AYM_BASE = "https://kararlarbilgibankasi.anayasa.gov.tr";

export async function searchAYMCases(
  keyword: string,
  maxResults: number = 5
): Promise<AYMSearchResult> {
  try {
    // AYM'nin arka plan arama endpoint'ini dene
    const response = await fetch(`${AYM_BASE}/api/karar/ara`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Origin": AYM_BASE,
        "Referer": `${AYM_BASE}/`,
      },
      body: JSON.stringify({
        aramaMetni: keyword,
        sayfa: 1,
        sayfaBoyutu: maxResults,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.sonuclar || data.kararlar || data.data)) {
        const items = data.sonuclar || data.kararlar || data.data;
        const cases: AYMCase[] = items.map((item: Record<string, unknown>) => ({
          baspikaNo: (item.basvuruNo as string) || (item.esasNo as string) || "",
          kararTarihi: (item.kararTarihi as string) || "",
          kararSonucu: (item.kararSonucu as string) || (item.sonuc as string) || "",
          haklar: Array.isArray(item.haklar) ? item.haklar : [],
          ozet: (item.ozet as string) || (item.kararOzeti as string) || "",
          basvurucu: (item.basvurucu as string) || "",
        }));

        return {
          cases,
          totalCount: (data.toplamSayfa as number) || (data.toplamKayit as number) || cases.length,
          success: true,
        };
      }
    }

    // API çalışmadıysa, bilinen kararları Claude'dan iste
    return {
      cases: [],
      totalCount: 0,
      success: false,
      error: "AYM API'ye erişilemedi. Claude AI bilgisi kullanılacak.",
    };
  } catch (error) {
    return {
      cases: [],
      totalCount: 0,
      success: false,
      error: `AYM bağlantı hatası: ${error instanceof Error ? error.message : "Bilinmeyen"}`,
    };
  }
}

/**
 * Kategori bazlı AYM arama terimleri
 */
export function getAYMKeywords(category: string): string {
  const keywords: Record<string, string> = {
    is_hukuku: "çalışma hakkı iş güvencesi",
    aile_hukuku: "aile hayatı velayet nafaka",
    ceza_hukuku: "adil yargılanma tutukluluk",
    tuketici_hukuku: "mülkiyet hakkı tüketici",
    kira_hukuku: "mülkiyet hakkı konut",
    miras_hukuku: "miras mülkiyet",
    idare_hukuku: "idari işlem etkili başvuru",
    ticaret_hukuku: "ticaret mülkiyet",
    icra_iflas: "mülkiyet hakkı icra",
  };
  return keywords[category] || "temel hak";
}
