"use client";

import { Scale, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-black text-slate-900 mb-2">Gizlilik Politikasi</h1>
        <p className="text-sm text-slate-400 mb-8">Son guncelleme: 30 Mart 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <h2 className="text-xl font-bold text-slate-900 mt-8">Giris</h2>
          <p>JusticeGuard olarak gizliliginize onem veriyoruz. Bu politika, kisisel verilerinizin nasil toplandigi, kullanildigi ve korunduguunu aciklar.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">Toplanan Bilgiler</h2>
          <p><strong>Dogrudan verdiginiz bilgiler:</strong> Kayit sirasinda ad, e-posta, sifre; dava analizi sirasinda olay ozeti ve belgeler; avukat kaydi sirasinda mesleki bilgiler.</p>
          <p><strong>Otomatik toplanan bilgiler:</strong> IP adresi, tarayici turu, ziyaret edilen sayfalar, erisim zamanlari.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">Bilgilerin Kullanimi</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hukuki analiz hizmetini sunmak</li>
            <li>Hesabinizi yonetmek</li>
            <li>Avukat-muvekkil eslestirmesi yapmak</li>
            <li>Platformu gelistirmek</li>
            <li>Guvenlik onlemleri almak</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">Veri Guvenligi</h2>
          <p>Verileriniz 256-bit SSL sifreleme ile korunmaktadir. Sifreler hash edilir ve acik metin olarak saklanmaz. Odeme bilgileri iyzico tarafindan PCI-DSS standartlarina uygun islenilir.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">Ucuncu Taraf Hizmetler</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase:</strong> Veritabani ve kimlik dogrulama</li>
            <li><strong>Anthropic Claude AI:</strong> Hukuki analiz (olay ozetleri islenir)</li>
            <li><strong>iyzico:</strong> Odeme isleme</li>
            <li><strong>Vercel:</strong> Web hosting</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8">Cerezler</h2>
          <p>Platformumuz oturum yonetimi icin zorunlu cerezler kullanir. Bu cerezler olmadan hizmet sunamayiz.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">Haklariniz</h2>
          <p>Verilerinize erisim, duzeltme, silme ve tasima haklarina sahipsiniz. Talepleriniz icin <strong>info@justiceguard.com</strong> adresine ulasabilirsiniz.</p>

          <h2 className="text-xl font-bold text-slate-900 mt-8">Degisiklikler</h2>
          <p>Bu politika zaman zaman guncellenebilir. Onemli degisikliklerde e-posta ile bilgilendirileceksiniz.</p>
        </div>
      </div>
    </div>
  );
}
