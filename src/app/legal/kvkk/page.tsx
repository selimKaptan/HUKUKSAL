"use client";

import { Scale, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">Justice<span className="text-blue-600">Guard</span></span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8">
          <ArrowLeft className="w-4 h-4" /> Ana Sayfa
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-2">KVKK Aydinlatma Metni</h1>
        <p className="text-sm text-slate-400 mb-8">Son guncelleme: 30 Mart 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <h2 className="text-xl font-bold text-slate-900 mt-8">1. Veri Sorumlusu</h2>
          <p>JusticeGuard (&quot;Platform&quot;) olarak, 6698 sayili Kisisel Verilerin Korunmasi Kanunu (&quot;KVKK&quot;) kapsaminda veri sorumlusu sifatiyla, kisisel verilerinizi asagida aciklanan amaclarla islemekteyiz.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">2. Islenen Kisisel Veriler</h2>
          <p>Platformumuz uzerinden asagidaki kisisel verileriniz islenmektedir:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
            <li><strong>Iletisim Bilgileri:</strong> E-posta adresi, telefon numarasi (avukatlar icin)</li>
            <li><strong>Hesap Bilgileri:</strong> Sifre (sifreli olarak saklanir), kullanici rolu</li>
            <li><strong>Dava Bilgileri:</strong> Olay ozeti, dava kategorisi, yuklenen belgeler</li>
            <li><strong>Mesleki Bilgiler (Avukatlar):</strong> Baro sicil bilgisi, uzmanlik alanlari, deneyim yili</li>
            <li><strong>Odeme Bilgileri:</strong> Odeme islemleri iyzico uzerinden gerceklestirilir, kart bilgileri platformumuzda saklanmaz</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">3. Kisisel Verilerin Islenme Amaci</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hukuki analiz hizmetinin sunulmasi</li>
            <li>Kullanici hesabinin olusturulmasi ve yonetilmesi</li>
            <li>Avukat-muvekkil eslestirme hizmetinin saglanmasi</li>
            <li>Odeme islemlerinin gerceklestirilmesi</li>
            <li>Platform guvenliginin saglanmasi</li>
            <li>Yasal yukumluluklerin yerine getirilmesi</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">4. Kisisel Verilerin Aktarimi</h2>
          <p>Kisisel verileriniz asagidaki taraflara aktarilabilir:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase:</strong> Veritabani hizmeti (AB sunuculari)</li>
            <li><strong>Anthropic (Claude AI):</strong> Yapay zeka analiz hizmeti (analiz metinleri)</li>
            <li><strong>iyzico:</strong> Odeme isleme hizmeti</li>
            <li><strong>Vercel:</strong> Hosting hizmeti</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">5. Veri Saklama Suresi</h2>
          <p>Kisisel verileriniz, hizmet suresi boyunca ve hesap silindikten sonra yasal yukulumlulukler geregi en fazla 5 yil saklanir.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">6. Veri Sahibinin Haklari (KVKK m.11)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kisisel verilerinizin islenip islenmedigini ogrenme</li>
            <li>Islenmisse buna iliskin bilgi talep etme</li>
            <li>Islenme amacini ve amacina uygun kullanilip kullanilmadigini ogrenme</li>
            <li>Yurt icinde veya yurt disinda aktarildigi ucuncu kisileri bilme</li>
            <li>Eksik veya yanlis islenmisse duzeltilmesini isteme</li>
            <li>KVKK m.7 kapsaminda silinmesini veya yok edilmesini isteme</li>
            <li>Islenen verilerin munhasiran otomatik sistemler vasitasiyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya cikmasina itiraz etme</li>
            <li>Kanuna aykiri olarak islenmesi sebebiyle zarara ugramaniz halinde zararin giderilmesini talep etme</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">7. Basvuru Yontemi</h2>
          <p>Yukaridaki haklarinizi kullanmak icin <strong>info@justiceguard.com</strong> adresine e-posta gonderebilirsiniz. Basvurunuz en gec 30 gun icinde ucretsiz olarak sonuclandirilacaktir.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">8. Cerez Politikasi</h2>
          <p>Platformumuz, oturum yonetimi icin zorunlu cerezler kullanmaktadir. Ucuncu taraf analitik cerezleri (varsa) ayri olarak onayiniza sunulacaktir.</p>
        </div>
      </div>
    </div>
  );
}
