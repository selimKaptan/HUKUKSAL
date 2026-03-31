"use client";

import { Scale, LogOut, History, Calculator, Clock, UserSearch, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Araçlar */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/pricing" className="px-3 py-2 text-sm text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Fiyatlar
          </Link>
          <Link href="/tools/mediation" className="px-3 py-2 text-sm text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" /> Arabuluculuk
          </Link>
          <Link href="/tools/statute-of-limitations" className="px-3 py-2 text-sm text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Zamanaşımı
          </Link>
          <Link href="/tools/find-lawyer" className="px-3 py-2 text-sm text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
            <UserSearch className="w-3.5 h-3.5" /> Avukat Bul
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {user.name || user.email.split("@")[0]}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user.name || "Kullanıcı"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                      <Scale className="w-4 h-4" /> Yeni Analiz
                    </Link>
                    <Link href="/history" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                      <History className="w-4 h-4" /> Dava Geçmişi
                    </Link>
                    <div className="md:hidden border-t border-slate-100 mt-1 pt-1">
                      <Link href="/tools/mediation" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                        <Calculator className="w-4 h-4" /> Arabuluculuk
                      </Link>
                      <Link href="/tools/statute-of-limitations" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                        <Clock className="w-4 h-4" /> Zamanaşımı
                      </Link>
                      <Link href="/tools/find-lawyer" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                        <UserSearch className="w-4 h-4" /> Avukat Bul
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => { signOut(); setMenuOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Çıkış Yap
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Giriş Yap</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">Analiz Başlat</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
