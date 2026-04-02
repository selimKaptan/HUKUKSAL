"use client";

/**
 * Bugünün Davası - Her gün ilginç bir gerçek dava özeti
 */

export interface DailyCase {
  id: number;
  title: string;
  court: string;
  year: string;
  summary: string;
  outcome: string;
  lesson: string;
}

export const DAILY_CASES: DailyCase[] = [
  { id: 1, title: "WhatsApp Mesajı Delil Olur mu?", court: "Yargıtay 9. HD", year: "2023", summary: "İşçi, işverenin WhatsApp üzerinden hakaret ettiğini iddia ederek tazminat davası açtı.", outcome: "WhatsApp mesajları delil kabul edildi, işçi kıdem tazminatı aldı.", lesson: "Dijital iletişim kayıtları mahkemede delil olarak kullanılabilir." },
  { id: 2, title: "Fazla Mesai İspatı Kime Ait?", court: "Yargıtay 22. HD", year: "2022", summary: "İşçi yıllarca fazla mesai yaptığını iddia etti ancak yazılı belge sunamadı.", outcome: "İşverenin kayıt tutma yükümlülüğü olduğu kabul edildi, tanık beyanları yeterli görüldü.", lesson: "Fazla mesai ispatında tanık beyanları ve işverenin kayıt yükümlülüğü önemlidir." },
  { id: 3, title: "Kiracının Tadilat Hakkı", court: "Yargıtay 6. HD", year: "2023", summary: "Kiracı, ev sahibinden izin almadan mutfağı yeniledi. Ev sahibi tahliye davası açtı.", outcome: "Kiracının yapısal olmayan tadilatlar yapabileceği kabul edildi, tahliye reddedildi.", lesson: "Yapısal olmayan tadilatlar için ev sahibi izni gerekmeyebilir, ancak taşınırken eski haline getirme yükümlülüğü vardır." },
  { id: 4, title: "Online Alışverişte 14 Gün Kuralı", court: "Tüketici Mahkemesi", year: "2023", summary: "Tüketici internetten aldığı telefonu 10 gün sonra iade etmek istedi, satıcı reddetti.", outcome: "14 günlük cayma hakkı kapsamında iade kabul edildi, ücret iade edildi.", lesson: "İnternet alışverişlerinde 14 gün içinde sebep göstermeksizin cayma hakkınız vardır." },
  { id: 5, title: "Mobbing Tazminatı", court: "Yargıtay 9. HD", year: "2022", summary: "Çalışan, sürekli olarak görev dışı işler verildiğini ve toplantılara çağrılmadığını ispatlayarak mobbing davası açtı.", outcome: "Mobbing tespit edildi, manevi tazminata hükmedildi.", lesson: "Sistematik psikolojik baskı (mobbing) için iş sözleşmesini haklı nedenle feshedip tazminat alabilirsiniz." },
  { id: 6, title: "Komşu Gürültüsü Davası", court: "Sulh Hukuk Mahkemesi", year: "2023", summary: "Üst kattaki komşunun sürekli gürültü yapması nedeniyle dava açıldı.", outcome: "Bilirkişi raporu ile gürültü tespit edildi, komşuya 5.000 TL manevi tazminat ödettirdi.", lesson: "Komşuluk hukukuna aykırı gürültü için hem manevi tazminat hem de gürültünün önlenmesi talep edilebilir." },
  { id: 7, title: "Trafik Kazası Değer Kaybı", court: "Asliye Ticaret", year: "2022", summary: "Kazada kusursuz olan sürücü, aracındaki değer kaybını sigorta şirketinden talep etti.", outcome: "Değer kaybı tazminatı ödenmesine hükmedildi.", lesson: "Trafik kazasında kusursuz veya az kusurluysanız, araç değer kaybını karşı tarafın sigortasından talep edebilirsiniz." },
  { id: 8, title: "İşe İade Davası", court: "İş Mahkemesi", year: "2023", summary: "30+ kişi çalışan işyerinde 2 yılı doldurmuş işçi, geçersiz nedenle fesih iddiasıyla dava açtı.", outcome: "Feshin geçersizliğine karar verildi, işe iade + 4 aya kadar boşta geçen süre ücreti.", lesson: "6 aydan fazla kıdemi olan işçiler, 30+ çalışanlı işyerlerinde iş güvencesi kapsamındadır." },
  { id: 9, title: "Miras Paylaşım Davası", court: "Asliye Hukuk", year: "2022", summary: "Kardeşlerden biri, babanın sağlığında diğer kardeşe fazla mal bıraktığını iddia etti.", outcome: "Saklı pay ihlali tespit edildi, tenkis davası ile denkleştirme yapıldı.", lesson: "Mirasçıların saklı payları vardır ve bu paylar vasiyetname ile bile ihlal edilemez." },
  { id: 10, title: "Kefaletin Geçersizliği", court: "Yargıtay 19. HD", year: "2023", summary: "Koca, eşinin rızası olmadan arkadaşına kefil oldu. Alacaklı kefalet borcunu istedi.", outcome: "Eş rızası olmadığı için kefalet geçersiz sayıldı.", lesson: "Evli kişilerin kefaleti için eşin yazılı rızası şarttır, aksi halde kefalet geçersizdir." },
  { id: 11, title: "Doktor Hatası Tazminatı", court: "Asliye Hukuk", year: "2023", summary: "Ameliyat sonrası komplikasyon gelişen hasta, doktorun bilgilendirme yükümlülüğünü yerine getirmediğini ispatlayarak dava açtı.", outcome: "Aydınlatılmış onam eksikliği tespit edildi, 50.000 TL manevi tazminat.", lesson: "Doktorlar ameliyat öncesi tüm riskleri yazılı olarak bildirmek zorundadır." },
  { id: 12, title: "Apartman Aidat Borcu", court: "Sulh Hukuk", year: "2022", summary: "Ev sahibi aidatı ödemeyince yönetim icra takibi başlattı.", outcome: "Aidat borcu kesinleşti, faiz ile birlikte tahsil edildi.", lesson: "Apartman aidatı yasal bir borçtur, ödenmezse icra takibi başlatılabilir." },
  { id: 13, title: "SGK Hizmet Tespiti", court: "İş Mahkemesi", year: "2023", summary: "İşçi, 3 yıl sigortasız çalıştırıldığını iddia ederek SGK hizmet tespiti davası açtı.", outcome: "Tanık beyanları ile çalışma ispatlandı, geriye dönük SGK kaydı yapıldı.", lesson: "Sigortasız çalıştırılsanız bile 5 yıl içinde hizmet tespiti davası açabilirsiniz." },
  { id: 14, title: "Engelli Raporu ve İş Güvencesi", court: "Yargıtay 9. HD", year: "2022", summary: "%45 engelli raporu olan çalışan, engeli nedeniyle işten çıkarıldığını iddia etti.", outcome: "Ayrımcılık tespit edildi, 8 aylık brüt ücret tutarında tazminata hükmedildi.", lesson: "Engelli çalışanların engeli nedeniyle işten çıkarılması ayrımcılıktır ve ağır tazminat gerektirir." },
];

export function getTodaysCase(): DailyCase {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_CASES[dayOfYear % DAILY_CASES.length];
}
