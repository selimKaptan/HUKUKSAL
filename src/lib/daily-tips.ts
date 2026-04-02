"use client";

/**
 * Günlük Hukuk İpucu + Streak Sistemi
 * Kullanıcıların her gün uygulamaya dönmesini sağlar
 */

export interface DailyTip {
  id: number;
  title: string;
  content: string;
  category: string;
  icon: string;
}

export const DAILY_TIPS: DailyTip[] = [
  { id: 1, title: "İşten Çıkarma Tazminatı", content: "1 yıldan fazla çalışan her işçi kıdem tazminatı almaya hak kazanır. Her çalışılan yıl için 1 brüt maaş tutarında ödeme yapılmalıdır.", category: "İş Hukuku", icon: "briefcase" },
  { id: 2, title: "Kiracı Hakları", content: "Ev sahibi, kira sözleşmesi devam ederken kiracıyı çıkaramaz. 10 yıllık uzama süresi dolmadan tahliye davası açılamaz.", category: "Kira Hukuku", icon: "home" },
  { id: 3, title: "Tüketici İade Hakkı", content: "İnternetten alınan ürünlerde 14 gün içinde cayma hakkınız vardır. Ürünü kullanmış olsanız bile iade edebilirsiniz.", category: "Tüketici Hukuku", icon: "shopping-bag" },
  { id: 4, title: "Trafik Kazası", content: "Trafik kazasında kusur oranınız ne olursa olsun, karşı tarafın sigortasından tedavi masraflarınızı talep edebilirsiniz.", category: "Tazminat Hukuku", icon: "car" },
  { id: 5, title: "Boşanma Nafakası", content: "Boşanma davasında kusuru az olan eş, diğer eşten yoksulluk nafakası talep edebilir. Nafaka süresiz olabilir.", category: "Aile Hukuku", icon: "heart" },
  { id: 6, title: "Miras Paylaşımı", content: "Eş sağ ise çocuklarla birlikte mirasın 1/4'ünü alır. Vasiyetname ile saklı paylar ihlal edilemez.", category: "Miras Hukuku", icon: "scroll" },
  { id: 7, title: "İhbar Tazminatı", content: "İşveren, işçiye önceden haber vermeden iş akdini feshederse ihbar tazminatı ödemek zorundadır. 6 aydan az çalışanlarda 2 hafta.", category: "İş Hukuku", icon: "bell" },
  { id: 8, title: "Arabuluculuk Zorunluluğu", content: "İş hukuku ve ticaret hukuku davalarında arabulucuya başvurmak zorunludur. Arabuluculuk 4 haftada sonuçlanır.", category: "İş Hukuku", icon: "handshake" },
  { id: 9, title: "Zamanaşımı", content: "İş davalarında zamanaşımı 5 yıldır. Kıdem tazminatı hakkı 5 yıl sonra düşer. Haklarınızı zamanında arayın!", category: "Genel", icon: "clock" },
  { id: 10, title: "Savcılık Şikayeti", content: "Hırsızlık, dolandırıcılık gibi suçlarda şikayet süresi 6 aydır. Suçu öğrendiğiniz tarihten itibaren başlar.", category: "Ceza Hukuku", icon: "shield" },
  { id: 11, title: "SGK Hakları", content: "7200 gün prim ödeyen kadınlar 58, erkekler 60 yaşında emekli olabilir. EYT ile prim günü şartı değişmiştir.", category: "Sosyal Güvenlik", icon: "heart-pulse" },
  { id: 12, title: "Apartman Kuralları", content: "Kat malikleri kurulu kararları tüm kat maliklerini bağlar. Gürültü yapan komşuya karşı yöneticiye başvurabilirsiniz.", category: "Kira Hukuku", icon: "building" },
  { id: 13, title: "İcra Takibi", content: "Borcunuz için icra takibi başlatıldığında 7 gün içinde itiraz hakkınız var. İtiraz etmezseniz kesinleşir.", category: "İcra Hukuku", icon: "file-warning" },
  { id: 14, title: "Tapu İptali", content: "Hile veya baskı ile devredilen tapu, 10 yıl içinde iptal davası ile geri alınabilir.", category: "Gayrimenkul", icon: "landmark" },
  { id: 15, title: "İş Kazası", content: "İş kazası geçiren işçi, işverenden maddi ve manevi tazminat talep edebilir. İş kazası bildirim süresi 3 gündür.", category: "İş Hukuku", icon: "hard-hat" },
  { id: 16, title: "Yıllık İzin", content: "1-5 yıl arası çalışan işçi yılda en az 14 gün ücretli izin hakkına sahiptir. İzin paraya çevrilemez.", category: "İş Hukuku", icon: "sun" },
  { id: 17, title: "Kredi Kartı Borcu", content: "Kredi kartı borcunu ödeyemiyorsanız yapılandırma talep edebilirsiniz. Faiz oranına itiraz hakkınız vardır.", category: "Tüketici Hukuku", icon: "credit-card" },
  { id: 18, title: "Vekaletname", content: "Genel vekaletname ile taşınmaz satışı yapılamaz. Taşınmaz satışı için özel vekaletname gerekir.", category: "Genel", icon: "file-text" },
  { id: 19, title: "Mobbing", content: "İş yerinde mobbinge uğruyorsanız iş sözleşmenizi haklı nedenle feshedip kıdem tazminatı alabilirsiniz.", category: "İş Hukuku", icon: "alert-triangle" },
  { id: 20, title: "Fazla Mesai", content: "Haftalık 45 saati aşan çalışma fazla mesaidir ve %50 zamlı ödenmesi gerekir. Yıllık 270 saati aşamaz.", category: "İş Hukuku", icon: "clock" },
  { id: 21, title: "Ayıplı Mal", content: "Satın aldığınız ürün ayıplı çıkarsa 2 yıl içinde ücretsiz onarım, değişim, iade veya indirim talep edebilirsiniz.", category: "Tüketici Hukuku", icon: "alert-circle" },
  { id: 22, title: "Kefalet", content: "Kefil olurken eşinizin yazılı rızası şarttır. Rıza olmadan verilen kefalet geçersizdir.", category: "Borçlar Hukuku", icon: "users" },
  { id: 23, title: "Tıbbi Malpraktis", content: "Doktor hatası sonucu zarar gördüyseniz hem doktora hem hastaneye tazminat davası açabilirsiniz. Zamanaşımı 5 yıldır.", category: "Sağlık Hukuku", icon: "stethoscope" },
  { id: 24, title: "Engelli Hakları", content: "Engel oranı %40 ve üzeri olan bireyler gelir vergisinden muaftır ve erken emeklilik hakkına sahiptir.", category: "Sosyal Güvenlik", icon: "accessibility" },
  { id: 25, title: "Nafaka Artışı", content: "Nafaka her yıl ÜFE oranında otomatik artar. Koşullar değişirse artırım veya azaltım davası açılabilir.", category: "Aile Hukuku", icon: "trending-up" },
  { id: 26, title: "Komşu Hakkı", content: "Komşunuzun ağacının dalları bahçenize uzanıyorsa, uyarı sonrası kesme hakkınız vardır.", category: "Komşuluk Hukuku", icon: "trees" },
  { id: 27, title: "Ücretsiz İzin", content: "İşveren tek taraflı olarak ücretsiz izne çıkaramaz. Ücretsiz izin için işçinin yazılı onayı gereklidir.", category: "İş Hukuku", icon: "calendar" },
  { id: 28, title: "E-Ticaret İade", content: "Kişiye özel üretilen ürünler, kozmetik ve iç giyim ürünleri cayma hakkı kapsamı dışındadır.", category: "Tüketici Hukuku", icon: "package" },
  { id: 29, title: "Vasiyetname", content: "El yazılı vasiyetname için noter şart değildir. Kendi el yazınızla tarih atıp imzalamanız yeterlidir.", category: "Miras Hukuku", icon: "pen" },
  { id: 30, title: "Kadına Şiddet", content: "6284 sayılı kanun kapsamında şiddete uğrayan kadınlar acil koruma kararı alabilir. ALO 183'ü arayın.", category: "Aile Hukuku", icon: "phone" },
  { id: 31, title: "Sendikal Haklar", content: "Her işçi sendikaya üye olma hakkına sahiptir. Sendika üyeliği nedeniyle işten çıkarma yasaktır.", category: "İş Hukuku", icon: "users" },
];

// Bugünün ipucunu getir (yılın gününe göre döner)
export function getTodaysTip(): DailyTip {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

// Streak sistemi
const STREAK_KEY = "hklrm_streak";

interface StreakData {
  currentStreak: number;
  lastVisitDate: string;
  longestStreak: number;
  totalVisits: number;
}

export function getStreak(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, lastVisitDate: "", longestStreak: 0, totalVisits: 0 };
  }
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (!stored) return { currentStreak: 0, lastVisitDate: "", longestStreak: 0, totalVisits: 0 };
    return JSON.parse(stored);
  } catch {
    return { currentStreak: 0, lastVisitDate: "", longestStreak: 0, totalVisits: 0 };
  }
}

export function updateStreak(): StreakData {
  const streak = getStreak();
  const today = new Date().toISOString().slice(0, 10);

  if (streak.lastVisitDate === today) {
    return streak; // Bugün zaten ziyaret edilmiş
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (streak.lastVisitDate === yesterday) {
    // Ardışık gün - streak devam
    streak.currentStreak += 1;
  } else if (streak.lastVisitDate) {
    // Streak kırıldı
    streak.currentStreak = 1;
  } else {
    // İlk ziyaret
    streak.currentStreak = 1;
  }

  streak.lastVisitDate = today;
  streak.totalVisits += 1;
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }
  return streak;
}
