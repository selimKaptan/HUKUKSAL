export const BARO_LIST = [
  "İstanbul Barosu",
  "Ankara Barosu",
  "İzmir Barosu",
  "Bursa Barosu",
  "Antalya Barosu",
  "Adana Barosu",
  "Gaziantep Barosu",
  "Konya Barosu",
  "Mersin Barosu",
  "Kayseri Barosu",
  "Eskişehir Barosu",
  "Diyarbakır Barosu",
  "Samsun Barosu",
  "Denizli Barosu",
  "Trabzon Barosu",
  "Muğla Barosu",
  "Manisa Barosu",
  "Kocaeli Barosu",
  "Sakarya Barosu",
  "Tekirdağ Barosu",
  "Hatay Barosu",
  "Malatya Barosu",
  "Erzurum Barosu",
  "Van Barosu",
  "Şanlıurfa Barosu",
] as const;

export type BaroName = (typeof BARO_LIST)[number];

export function verifyBaroNumber(
  barAssociation: string,
  sicilNo: string
): { verified: boolean; message: string } {
  const trimmedSicil = sicilNo.trim();
  const trimmedBaro = barAssociation.trim();

  if (!trimmedBaro) {
    return { verified: false, message: "Baro adı boş bırakılamaz." };
  }

  const isKnownBaro = (BARO_LIST as readonly string[]).includes(trimmedBaro);
  if (!isKnownBaro) {
    return {
      verified: false,
      message: "Geçersiz baro adı. Lütfen listeden bir baro seçin.",
    };
  }

  if (!trimmedSicil) {
    return { verified: false, message: "Sicil numarası boş bırakılamaz." };
  }

  if (!/^\d+$/.test(trimmedSicil)) {
    return {
      verified: false,
      message: "Sicil numarası yalnızca rakamlardan oluşmalıdır.",
    };
  }

  if (trimmedSicil.length < 5) {
    return {
      verified: false,
      message: "Sicil numarası en az 5 haneli olmalıdır.",
    };
  }

  return {
    verified: true,
    message: `${trimmedBaro} sicil numarası doğrulandı.`,
  };
}
