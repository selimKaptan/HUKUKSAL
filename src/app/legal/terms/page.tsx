"use client";

import { Scale, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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

        <h1 className="text-3xl font-black text-slate-900 mb-2">Kullanim Sartlari</h1>
        <p className="text-sm text-slate-400 mb-8">Son guncelleme: 30 Mart 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <h2 className="text-xl font-bold text-slate-900 mt-8">1. Hizmet Tanimi</h2>
          <p>JusticeGuard, yapay zeka destekli hukuki analiz ve emsal karar karsilastirma platformudur. Platform, kullanicilarin davalarinin kazanma ihtimalini degerlendirmelerine yardimci olur.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">2. Onemli Uyari</h2>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="font-bold text-amber-800">Bu platform avukatlik hizmeti vermez ve hukuki danismanlik yerine gecmez.</p>
            <p className="text-amber-700 mt-2">Sunulan analizler bilgilendirme amaclıdır. Herhangi bir hukuki islem baslatmadan once mutlaka bir avukata danisiniz. Platform, analiz sonuclarinin dogruluguunu garanti etmez.</p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-8">3. Kullanici Yukumlulukleri</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Dogru ve guncel bilgiler vermek</li>
            <li>Hesap bilgilerini gizli tutmak</li>
            <li>Platformu yasadisi amaclarla kullanmamak</li>
            <li>Baskalarinin haklarini ihlal etmemek</li>
            <li>Platformu kotu niyetli kullanimdan kacinmak</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">4. Avukat Kullanicilari</h2>
          <p>Avukat olarak kayit olan kullanicilar:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gecerli bir baro kaydina sahip olmalidir</li>
            <li>Mesleki bilgilerini dogru beytan etmelidir</li>
            <li>Avukatlik meslek kurallarina uygun hareket etmelidir</li>
            <li>Platform uzerinden yaniltici bilgi paylasmamalidir</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">5. Odeme ve Abonelik</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Ucretsiz plan: 3 dava analizi hakki</li>
            <li>Pro plan: Aylik veya yillik abonelik ile sinirsiz analiz</li>
            <li>Odemeler iyzico uzerinden guvenle gerceklestirilir</li>
            <li>Abonelik donemi sonunda otomatik yenilenir</li>
            <li>Istediginiz zaman iptal edebilirsiniz</li>
            <li>Iptal durumunda mevcut donem sonuna kadar hizmet devam eder</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">6. Iade Politikasi</h2>
          <p>Satin alim tarihinden itibaren 14 gun icinde kullanilmayan analizler icin tam iade yapilir. Kullanilmis analizler icin iade yapilmaz.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">7. Fikri Mulkiyet</h2>
          <p>Platform uzerindeki tum icerikler, tasarimlar, yazilimlar ve markalar JusticeGuard&apos;a aittir. Izinsiz kopyalama, dagitma veya degistirme yasaktir.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">8. Sorumluluk Sinirlamasi</h2>
          <p>JusticeGuard, analiz sonuclarinin dogrulugu veya eksiksizligi konusunda garanti vermez. Platform kullanilarak alinan kararlarin sonuclarindan sorumluluk kabul etmez. Azami sorumluluk, kullanicinin son 12 ayda odedigi toplam ucretle sinirlidir.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">9. Uyusmazlik Cozumu</h2>
          <p>Bu sartlardan dogan uyusmazliklarda Istanbul Mahkemeleri ve Icra Daireleri yetkilidir. Turkiye Cumhuriyeti hukuku uygulanir.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">10. Iletisim</h2>
          <p>Sorulariniz icin: <strong>info@justiceguard.com</strong></p>
        </div>
      </div>
    </div>
  );
}
