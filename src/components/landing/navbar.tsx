"use client";

import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Justice<span className="text-blue-600">Guard</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button size="sm">Analiz Başlat</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
