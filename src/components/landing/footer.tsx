"use client";

import { Scale, Smartphone } from "lucide-react";
import Link from "next/link";
import { APP_STORE_URL, PLAY_STORE_URL } from "./hero-section";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Açıklama */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Justice<span className="text-blue-400">Guard</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              AI destekli hukuki analiz platformu. Haklarınızı öğrenin,
              emsal kararları inceleyin, uzman avukat bulun.
            </p>
          </div>

          {/* Araçlar */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Araçlar</h3>
            <div className="space-y-2 text-sm">
              <Link href="/dashboard" className="block hover:text-white transition-colors">Dava Analizi</Link>
              <Link href="/tools/find-lawyer" className="block hover:text-white transition-colors">Avukat Bul</Link>
              <Link href="/tools/mediation" className="block hover:text-white transition-colors">Arabuluculuk Hesaplama</Link>
              <Link href="/tools/statute-of-limitations" className="block hover:text-white transition-colors">Zamanaşımı Hesaplama</Link>
              <Link href="/tools/glossary" className="block hover:text-white transition-colors">Hukuk Sözlüğü</Link>
            </div>
          </div>

          {/* Yasal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Yasal</h3>
            <div className="space-y-2 text-sm">
              <Link href="/legal/privacy" className="block hover:text-white transition-colors">Gizlilik Politikası</Link>
              <Link href="/legal/terms" className="block hover:text-white transition-colors">Kullanım Koşulları</Link>
              <Link href="/legal/kvkk" className="block hover:text-white transition-colors">KVKK Aydınlatma Metni</Link>
            </div>

            <h3 className="text-sm font-semibold text-white mb-3 mt-6 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> Uygulamayı İndir
            </h3>
            <div className="space-y-2 text-sm">
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                App Store
              </a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M3.18 23.67c-.28-.56-.18-4.58-.18-11.67S2.9.89 3.18.33C3.37 0 3.63 0 3.85.09l10.37 5.93c.22.12.22.36 0 .48L8.43 10.04l5.79 3.54c.22.12.22.36 0 .48L3.85 19.99l-.03.02 10.4 3.5c.22.08.22.32 0 .4L3.85 23.91c-.22.08-.48.08-.67-.24z" /><path d="M14.22 6.5l5.56-3.18c.44-.25.8-.04.8.48v16.4c0 .52-.36.73-.8.48l-5.56-3.18L8.43 13.96V10.04l5.79-3.54z" /></svg>
                Google Play
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-center md:text-left">
            &copy; 2026 JusticeGuard. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-center md:text-right text-slate-500">
            Bu platform hukuki danışmanlık hizmeti vermez. Sonuçlar bilgilendirme amaçlıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
