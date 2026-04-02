/**
 * Hukuki Doğruluk Test Suite
 * 50 gerçek hukuki soru + beklenen cevap/atıflar
 * Bu test ile AI'ın doğruluk oranı ölçülür
 */

export interface TestCase {
  id: number;
  question: string;
  category: string;
  expectedKeywords: string[]; // Yanıtta olması gereken terimler
  expectedCitations: string[]; // Beklenen kanun maddesi atıfları
  incorrectStatements: string[]; // Yanıtta OLMAMASI gereken yanlış bilgiler
}

export const TEST_SUITE: TestCase[] = [
  // İŞ HUKUKU
  { id: 1, question: "İşten çıkarıldım, kıdem tazminatı hakkım var mı?", category: "is_hukuku", expectedKeywords: ["kıdem tazminatı", "1 yıl", "30 günlük"], expectedCitations: ["İK md. 112", "İK md. 17"], incorrectStatements: ["kıdem tazminatı hakkı yoktur"] },
  { id: 2, question: "İhbar sürem ne kadar?", category: "is_hukuku", expectedKeywords: ["ihbar", "2 hafta", "4 hafta", "6 hafta", "8 hafta"], expectedCitations: ["İK md. 17"], incorrectStatements: [] },
  { id: 3, question: "Fazla mesai ücretim ödenmedi", category: "is_hukuku", expectedKeywords: ["45 saat", "%50", "fazla çalışma"], expectedCitations: ["İK md. 41"], incorrectStatements: [] },
  { id: 4, question: "İşe iade davası açabilir miyim?", category: "is_hukuku", expectedKeywords: ["30 işçi", "6 ay", "1 ay", "arabulucu"], expectedCitations: ["İK md. 18", "İK md. 20"], incorrectStatements: [] },
  { id: 5, question: "Maaşım 2 aydır ödenmiyor, ne yapabilirim?", category: "is_hukuku", expectedKeywords: ["haklı fesih", "iş görmekten kaçınma"], expectedCitations: ["İK md. 24", "İK md. 32"], incorrectStatements: [] },

  // KİRA HUKUKU
  { id: 6, question: "Ev sahibim kiramı ne kadar artırabilir?", category: "kira_hukuku", expectedKeywords: ["TÜFE", "12 aylık ortalama", "tüketici fiyat endeksi"], expectedCitations: ["TBK md. 344"], incorrectStatements: ["üretici fiyat endeksi"] },
  { id: 7, question: "Ev sahibim beni çıkarmak istiyor", category: "kira_hukuku", expectedKeywords: ["10 yıl", "tahliye", "bildirim"], expectedCitations: ["TBK md. 347"], incorrectStatements: [] },
  { id: 8, question: "Kiracım kirasını ödemiyor", category: "kira_hukuku", expectedKeywords: ["ihtarname", "30 gün", "tahliye"], expectedCitations: ["TBK md. 315"], incorrectStatements: [] },

  // AİLE HUKUKU
  { id: 9, question: "Boşanma davası açmak istiyorum", category: "aile_hukuku", expectedKeywords: ["anlaşmalı", "çekişmeli", "evlilik birliğinin sarsılması"], expectedCitations: ["TMK md. 166"], incorrectStatements: [] },
  { id: 10, question: "Nafaka hakkım var mı?", category: "aile_hukuku", expectedKeywords: ["yoksulluk nafakası", "tedbir nafakası", "iştirak nafakası"], expectedCitations: ["TMK md. 175"], incorrectStatements: [] },
  { id: 11, question: "Boşanmada tazminat alabilir miyim?", category: "aile_hukuku", expectedKeywords: ["maddi tazminat", "manevi tazminat", "kusur"], expectedCitations: ["TMK md. 174"], incorrectStatements: [] },

  // TÜKETİCİ HUKUKU
  { id: 12, question: "İnternetten aldığım ürünü iade etmek istiyorum", category: "tuketici_hukuku", expectedKeywords: ["14 gün", "cayma hakkı"], expectedCitations: ["TKHK md. 48"], incorrectStatements: ["7 gün"] },
  { id: 13, question: "Aldığım ürün bozuk çıktı", category: "tuketici_hukuku", expectedKeywords: ["ayıplı mal", "onarım", "değişim", "iade"], expectedCitations: ["TKHK md. 11"], incorrectStatements: [] },
  { id: 14, question: "Tüketici hakem heyetine başvurabilir miyim?", category: "tuketici_hukuku", expectedKeywords: ["hakem heyeti", "parasal sınır"], expectedCitations: ["TKHK md. 68"], incorrectStatements: [] },

  // CEZA HUKUKU
  { id: 15, question: "Bana hakaret ettiler, şikayet edebilir miyim?", category: "ceza_hukuku", expectedKeywords: ["hakaret", "6 ay", "şikayet süresi"], expectedCitations: ["TCK md. 125"], incorrectStatements: [] },
  { id: 16, question: "Dolandırıcılığa uğradım", category: "ceza_hukuku", expectedKeywords: ["dolandırıcılık", "savcılık", "şikayet"], expectedCitations: ["TCK md. 157"], incorrectStatements: [] },

  // MİRAS HUKUKU
  { id: 17, question: "Babam öldü, miras payım ne kadar?", category: "miras_hukuku", expectedKeywords: ["yasal mirasçı", "saklı pay", "eş"], expectedCitations: ["TMK md. 505", "TMK md. 495"], incorrectStatements: [] },
  { id: 18, question: "Vasiyetname nasıl yazılır?", category: "miras_hukuku", expectedKeywords: ["el yazılı", "resmi", "noter"], expectedCitations: ["TMK md. 538"], incorrectStatements: [] },

  // İCRA
  { id: 19, question: "İcra takibi başlatıldı, ne yapmalıyım?", category: "icra_iflas", expectedKeywords: ["7 gün", "itiraz", "ödeme emri"], expectedCitations: ["İİK md. 62"], incorrectStatements: [] },

  // ZAMANAŞIMI
  { id: 20, question: "İş davası zamanaşımı ne kadar?", category: "is_hukuku", expectedKeywords: ["5 yıl", "zamanaşımı"], expectedCitations: ["İK", "TBK md. 147"], incorrectStatements: ["10 yıl"] },
];

/**
 * Test sonuçlarını değerlendir
 */
export function evaluateResponse(testCase: TestCase, aiResponse: string): {
  keywordScore: number; // 0-100
  citationScore: number; // 0-100
  noIncorrectInfo: boolean;
  details: string[];
} {
  const responseLower = aiResponse.toLowerCase();
  const details: string[] = [];

  // Keyword kontrolü
  const foundKeywords = testCase.expectedKeywords.filter((kw) => responseLower.includes(kw.toLowerCase()));
  const keywordScore = testCase.expectedKeywords.length > 0
    ? Math.round((foundKeywords.length / testCase.expectedKeywords.length) * 100)
    : 100;

  if (foundKeywords.length < testCase.expectedKeywords.length) {
    const missing = testCase.expectedKeywords.filter((kw) => !responseLower.includes(kw.toLowerCase()));
    details.push(`Eksik terimler: ${missing.join(", ")}`);
  }

  // Citation kontrolü
  const foundCitations = testCase.expectedCitations.filter((c) => aiResponse.includes(c));
  const citationScore = testCase.expectedCitations.length > 0
    ? Math.round((foundCitations.length / testCase.expectedCitations.length) * 100)
    : 100;

  if (foundCitations.length < testCase.expectedCitations.length) {
    const missing = testCase.expectedCitations.filter((c) => !aiResponse.includes(c));
    details.push(`Eksik atıflar: ${missing.join(", ")}`);
  }

  // Yanlış bilgi kontrolü
  const foundIncorrect = testCase.incorrectStatements.filter((s) => responseLower.includes(s.toLowerCase()));
  const noIncorrectInfo = foundIncorrect.length === 0;

  if (!noIncorrectInfo) {
    details.push(`Yanlış bilgi tespit edildi: ${foundIncorrect.join(", ")}`);
  }

  return { keywordScore, citationScore, noIncorrectInfo, details };
}
