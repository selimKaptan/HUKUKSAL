"use client";

import { Scale } from "lucide-react";
import Link from "next/link";

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
