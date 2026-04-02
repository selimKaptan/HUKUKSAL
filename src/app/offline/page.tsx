"use client";

import { Scale, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <WifiOff className="w-10 h-10 text-white" />
        </div>
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Haklarım
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Internet Baglantisi Yok
        </h1>
        <p className="text-slate-500 mb-8">
          Haklarım&apos;ı kullanmak icin internet baglantisi gereklidir.
          Lutfen baglantinizi kontrol edip tekrar deneyin.
        </p>
        <Button onClick={() => window.location.reload()} size="lg" className="group">
          <RefreshCw className="w-5 h-5 mr-2 group-hover:animate-spin" />
          Tekrar Dene
        </Button>
      </div>
    </div>
  );
}
