"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scale, ArrowLeft, User, Lock, Shield, Trash2, LogOut, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getUserSubscription, isAdmin } from "@/lib/subscription";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [planInfo, setPlanInfo] = useState({ planId: "free", analysisUsed: 0, analysisLimit: 3 });

  useEffect(() => {
    if (!loading && !user) { router.push("/auth/login"); return; }
    if (user) {
      setName(user.name || "");
      const sub = getUserSubscription(user.id, user.email);
      setPlanInfo({ planId: sub.planId, analysisUsed: sub.analysisUsed, analysisLimit: sub.analysisLimit });
    }
  }, [user, loading, router]);

  const handleSaveName = () => {
    if (!user || !name.trim()) return;
    const stored = localStorage.getItem("jg_user");
    if (stored) {
      const u = JSON.parse(stored);
      u.name = name.trim();
      localStorage.setItem("jg_user", JSON.stringify(u));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = () => {
    if (!confirm("Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    if (!confirm("GERÇEKTEN silmek istiyor musunuz? Tüm verileriniz kaybolacak.")) return;
    // localStorage temizle
    const keys = Object.keys(localStorage).filter(k => k.startsWith("jg_"));
    keys.forEach(k => localStorage.removeItem(k));
    signOut();
    router.push("/");
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-400">Yükleniyor...</div></div>;

  const isAdminUser = isAdmin(user.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">Justice<span className="text-blue-600">Guard</span></span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <h1 className="text-2xl font-black text-slate-900 mb-6">Hesap Ayarları</h1>

        <div className="space-y-4">
          {/* Profil */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Profil Bilgileri</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Ad Soyad</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">E-posta</label>
                    <input value={user.email} disabled className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={handleSaveName} disabled={!name.trim()}>
                    {saved ? <><Check className="w-3.5 h-3.5 mr-1" /> Kaydedildi</> : "Kaydet"}
                  </Button>
                  <span className="text-xs text-slate-400">Rol: {user.role === "lawyer" ? "Avukat" : "Müvekkil"}</span>
                  {isAdminUser && <Badge variant="danger">Admin</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Abonelik */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Abonelik</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">Plan: <strong>{planInfo.planId === "admin" ? "Admin (Sınırsız)" : planInfo.planId === "free" ? "Ücretsiz" : "Pro"}</strong></p>
                  {planInfo.analysisLimit > 0 && (
                    <p className="text-xs text-slate-500 mt-1">Kullanım: {planInfo.analysisUsed} / {planInfo.analysisLimit} analiz</p>
                  )}
                  {planInfo.analysisLimit === -1 && <p className="text-xs text-emerald-600 mt-1">Sınırsız analiz hakkı</p>}
                </div>
                {planInfo.planId === "free" && (
                  <Link href="/pricing"><Button size="sm" variant="outline">Pro&apos;ya Geç</Button></Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Güvenlik */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Güvenlik</h2>
              <div className="space-y-3">
                <Link href="/auth/forgot-password" className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="text-sm text-slate-700">Şifre Değiştir</span>
                  <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tehlikeli Bölge */}
          <Card className="border-red-200">
            <CardContent className="p-6">
              <h2 className="text-sm font-bold text-red-700 mb-4 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Tehlikeli Bölge</h2>
              <p className="text-xs text-slate-500 mb-4">Bu işlemler geri alınamaz.</p>
              <div className="flex gap-3">
                <Button size="sm" variant="outline" onClick={() => { signOut(); router.push("/"); }} className="text-slate-600">
                  <LogOut className="w-3.5 h-3.5 mr-1" /> Çıkış Yap
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600 text-white">
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Hesabı Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
