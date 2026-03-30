import type { CaseCategory } from "@/types/database";

export interface Lawyer {
  id: string;
  name: string;
  title: string;
  specialties: CaseCategory[];
  barAssociation: string;
  city: string;
  experience: number;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  about: string;
  languages: string[];
  consultationFee: string;
}

export const LAWYERS_DB: Lawyer[] = [
  {
    id: "l1",
    name: "Av. Mehmet Yılmaz",
    title: "İş Hukuku Uzmanı",
    specialties: ["is_hukuku", "icra_iflas"],
    barAssociation: "İstanbul Barosu",
    city: "İstanbul",
    experience: 18,
    rating: 4.8,
    reviewCount: 234,
    phone: "+90 212 XXX XX XX",
    email: "mehmet.yilmaz@example.com",
    about: "18 yıllık iş hukuku deneyimi. İşe iade, kıdem tazminatı ve işçi-işveren uyuşmazlıklarında uzman.",
    languages: ["Türkçe", "İngilizce"],
    consultationFee: "İlk görüşme ücretsiz",
  },
  {
    id: "l2",
    name: "Av. Ayşe Kara",
    title: "Aile Hukuku Uzmanı",
    specialties: ["aile_hukuku", "miras_hukuku"],
    barAssociation: "Ankara Barosu",
    city: "Ankara",
    experience: 15,
    rating: 4.9,
    reviewCount: 312,
    phone: "+90 312 XXX XX XX",
    email: "ayse.kara@example.com",
    about: "Boşanma, velayet, nafaka ve miras davaları konusunda 15 yıllık tecrübe. Arabuluculuk sertifikalı.",
    languages: ["Türkçe"],
    consultationFee: "500 TL",
  },
  {
    id: "l3",
    name: "Av. Ali Demir",
    title: "Ceza Hukuku Uzmanı",
    specialties: ["ceza_hukuku"],
    barAssociation: "İzmir Barosu",
    city: "İzmir",
    experience: 22,
    rating: 4.7,
    reviewCount: 189,
    phone: "+90 232 XXX XX XX",
    email: "ali.demir@example.com",
    about: "Ağır ceza davaları, siber suçlar ve beyaz yaka suçları konusunda deneyimli. Yargıtay aşaması dahil tam temsil.",
    languages: ["Türkçe", "İngilizce", "Almanca"],
    consultationFee: "750 TL",
  },
  {
    id: "l4",
    name: "Av. Zeynep Aksoy",
    title: "Tüketici Hukuku Uzmanı",
    specialties: ["tuketici_hukuku", "ticaret_hukuku"],
    barAssociation: "İstanbul Barosu",
    city: "İstanbul",
    experience: 12,
    rating: 4.6,
    reviewCount: 156,
    phone: "+90 216 XXX XX XX",
    email: "zeynep.aksoy@example.com",
    about: "Tüketici hakları, ayıplı mal davaları ve e-ticaret uyuşmazlıkları konusunda uzman.",
    languages: ["Türkçe", "İngilizce"],
    consultationFee: "İlk görüşme ücretsiz",
  },
  {
    id: "l5",
    name: "Av. Hasan Öztürk",
    title: "Gayrimenkul & Kira Hukuku Uzmanı",
    specialties: ["kira_hukuku", "icra_iflas"],
    barAssociation: "Bursa Barosu",
    city: "Bursa",
    experience: 20,
    rating: 4.8,
    reviewCount: 201,
    phone: "+90 224 XXX XX XX",
    email: "hasan.ozturk@example.com",
    about: "Kira uyuşmazlıkları, tahliye davaları, gayrimenkul alım-satım ve kat mülkiyeti konularında uzman.",
    languages: ["Türkçe"],
    consultationFee: "400 TL",
  },
  {
    id: "l6",
    name: "Av. Fatma Şahin",
    title: "İdare Hukuku Uzmanı",
    specialties: ["idare_hukuku"],
    barAssociation: "Ankara Barosu",
    city: "Ankara",
    experience: 16,
    rating: 4.7,
    reviewCount: 143,
    phone: "+90 312 XXX XX XX",
    email: "fatma.sahin@example.com",
    about: "İdari dava, iptal davası, tam yargı davası ve memur hakları konusunda uzman. Danıştay tecrübeli.",
    languages: ["Türkçe", "Fransızca"],
    consultationFee: "600 TL",
  },
  {
    id: "l7",
    name: "Av. Emre Yıldız",
    title: "Ticaret Hukuku Uzmanı",
    specialties: ["ticaret_hukuku", "icra_iflas"],
    barAssociation: "İstanbul Barosu",
    city: "İstanbul",
    experience: 14,
    rating: 4.5,
    reviewCount: 178,
    phone: "+90 212 XXX XX XX",
    email: "emre.yildiz@example.com",
    about: "Şirketler hukuku, haksız rekabet, iflas ve konkordato davaları. Kurumsal danışmanlık hizmeti.",
    languages: ["Türkçe", "İngilizce"],
    consultationFee: "1000 TL",
  },
  {
    id: "l8",
    name: "Av. Selin Aydın",
    title: "Miras Hukuku Uzmanı",
    specialties: ["miras_hukuku", "aile_hukuku"],
    barAssociation: "Antalya Barosu",
    city: "Antalya",
    experience: 11,
    rating: 4.6,
    reviewCount: 98,
    phone: "+90 242 XXX XX XX",
    email: "selin.aydin@example.com",
    about: "Miras paylaşımı, tenkis davaları, vasiyetname hazırlama ve veraset işlemleri konusunda deneyimli.",
    languages: ["Türkçe", "İngilizce"],
    consultationFee: "500 TL",
  },
];

export function findLawyersByCategory(category: CaseCategory): Lawyer[] {
  return LAWYERS_DB
    .filter((l) => l.specialties.includes(category))
    .sort((a, b) => b.rating - a.rating);
}

export function findLawyersByCity(city: string): Lawyer[] {
  return LAWYERS_DB.filter(
    (l) => l.city.toLowerCase() === city.toLowerCase()
  );
}

export function findLawyers(category?: CaseCategory, city?: string): Lawyer[] {
  let results = [...LAWYERS_DB];
  if (category) results = results.filter((l) => l.specialties.includes(category));
  if (city) results = results.filter((l) => l.city.toLowerCase() === city.toLowerCase());
  return results.sort((a, b) => b.rating - a.rating);
}
