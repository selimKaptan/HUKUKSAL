"use client";

import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Justice<span className="text-blue-400">Guard</span>
            </span>
          </div>
          <p className="text-sm text-center md:text-right">
            Bu platform hukuki danışmanlık hizmeti vermez. Sonuçlar bilgilendirme
            amaçlıdır.
            <br />
            &copy; 2026 JusticeGuard. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
