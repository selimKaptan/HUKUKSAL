"use client";

import { Scale } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Justice<span className="text-blue-400">Guard</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Yapay zeka destekli hukuki analiz platformu. Davanizi analiz edin, haklarinizi bilin.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">Platform</h4>
            <div className="space-y-2 text-sm">
              <Link href="/dashboard" className="block hover:text-white transition-colors">Dava Analizi</Link>
              <Link href="/tools/mediation" className="block hover:text-white transition-colors">Arabuluculuk</Link>
              <Link href="/tools/statute-of-limitations" className="block hover:text-white transition-colors">Zamanasimi</Link>
              <Link href="/tools/find-lawyer" className="block hover:text-white transition-colors">Avukat Bul</Link>
              <Link href="/pricing" className="block hover:text-white transition-colors">Fiyatlar</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">Hesap</h4>
            <div className="space-y-2 text-sm">
              <Link href="/auth/register" className="block hover:text-white transition-colors">Kayit Ol</Link>
              <Link href="/auth/login" className="block hover:text-white transition-colors">Giris Yap</Link>
              <Link href="/auth/register/lawyer" className="block hover:text-white transition-colors">Avukat Kaydi</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">Yasal</h4>
            <div className="space-y-2 text-sm">
              <Link href="/legal/kvkk" className="block hover:text-white transition-colors">KVKK Aydinlatma</Link>
              <Link href="/legal/privacy" className="block hover:text-white transition-colors">Gizlilik Politikasi</Link>
              <Link href="/legal/terms" className="block hover:text-white transition-colors">Kullanim Sartlari</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; 2026 JusticeGuard. Tum haklari saklidir.
          </p>
          <p className="text-xs text-center">
            Bu platform hukuki danismanlik hizmeti vermez. Sonuclar bilgilendirme amaclidir.
          </p>
        </div>
      </div>
    </footer>
  );
}
