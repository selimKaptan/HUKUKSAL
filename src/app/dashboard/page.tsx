"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, FileSearch, History, Calculator, Clock, UserSearch, CreditCard, ArrowRight, LogOut, MessageCircle, Shield, Mail, Gift, Zap, Loader2 } from "lucide-react";
import { CASE_CATEGORY_LABELS } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { saveCaseResult } from "@/lib/case-storage";
import { saveCase } from "@/lib/db";
import { canMakeAnalysis, incrementAnalysisUsage, isAdmin } from "@/lib/subscription";
import type { CaseCategory } from "@/types/database";

interface FormData {
  title: string;
  category: CaseCategory | "";
  eventSummary: string;
  eventDate: string;
  opposingParty: string;
  additionalNotes: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    eventSummary: "",
    eventDate: "",
    opposingParty: "",
    additionalNotes: "",
  });

  const updateForm = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    // Kullanım limiti kontrolü
    if (user) {
      const check = canMakeAnalysis(user.id, user.email);
      if (!check.allowed) {
        alert(check.message || "Analiz limitiniz dolmuş.");
        router.push("/pricing");
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSummary: formData.eventSummary,
          category: formData.category,
          additionalNotes: formData.additionalNotes,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const result = await response.json();

      // Analiz kullanımını artır
      if (user) incrementAnalysisUsage(user.id);

      // Save to user history if logged in
      if (user) {
        // localStorage (eski yöntem - fallback)
        saveCaseResult(
          user.id,
          formData.title,
          formData.category as import("@/types/database").CaseCategory,
          formData.eventSummary,
          result,
          result.aiProvider || "local"
        );
        // Supabase DB
        saveCase(user.id, {
          user_id: user.id,
          title: formData.title,
          category: formData.category as import("@/types/database").CaseCategory,
          event_summary: formData.eventSummary,
          additional_notes: formData.additionalNotes,
          win_probability: result.winProbability,
          analysis_report: result.analysisReport,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          risk_factors: result.riskFactors,
          suggested_actions: result.suggestedActions,
          recommendation: result.recommendation,
          estimated_duration_days: result.estimatedDuration?.avgDays,
          ai_provider: result.aiProvider || "local",
        }).catch(() => {}); // DB hatası olursa sessiz geç
      }

      // Store result in sessionStorage for the results page
      sessionStorage.setItem(
        "analysisResult",
        JSON.stringify({
          result,
          caseTitle: formData.title,
          category: formData.category,
        })
      );

      router.push("/results");
    } catch (error) {
      console.error("Error:", error);
      setIsAnalyzing(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse text-slate-400">Yükleniyor...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:block">{user.name || user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); router.push("/"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Hoşgeldin Paneli - wizard kapalıyken göster */}
        {!showWizard && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Hoşgeldin */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 mb-1">Hoşgeldin, {user.name || "Kullanıcı"}!</h1>
              <p className="text-slate-500">Davanızı analiz edin, haklarınızı öğrenin.</p>
            </div>

            {/* Ana Aksiyon - Yeni Analiz */}
            <div
              onClick={() => setShowWizard(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 cursor-pointer hover:shadow-2xl hover:shadow-blue-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Yeni Dava Analizi Baslat</h2>
                  <p className="text-blue-100">Olayinizi anlatin, yapay zeka kazanma ihtimalinizi hesaplasin.</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSearch className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            {/* Hızlı Erişim Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Link href="/history">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group">
                  <History className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 mb-1">Dava Gecmisi</h3>
                  <p className="text-xs text-slate-500">Önceki analizlerinizi görüntüleyin</p>
                </div>
              </Link>
              <Link href="/tools/find-lawyer">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group">
                  <UserSearch className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 mb-1">Avukat Bul</h3>
                  <p className="text-xs text-slate-500">Uzman avukatlarla eşleşin</p>
                </div>
              </Link>
              <Link href="/tools/mediation">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer group">
                  <Calculator className="w-8 h-8 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 mb-1">Arabuluculuk</h3>
                  <p className="text-xs text-slate-500">Maliyet karşılaştırması yapın</p>
                </div>
              </Link>
              <Link href="/ask">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-violet-200 transition-all cursor-pointer group">
                  <MessageCircle className="w-8 h-8 text-violet-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 mb-1">Hukuk Danışmanı</h3>
                  <p className="text-xs text-slate-500">AI&apos;a soru sorun</p>
                </div>
              </Link>
            </div>

            {/* Alt Araçlar */}
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/messages">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                  <Mail className="w-6 h-6 text-slate-400" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Mesajlar</h3>
                    <p className="text-xs text-slate-500">Avukatınızla yazışın</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto" />
                </div>
              </Link>
              <Link href="/tools/statute-of-limitations">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                  <Clock className="w-6 h-6 text-slate-400" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Zamanaşımı Hesaplayıcı</h3>
                    <p className="text-xs text-slate-500">Sürelerinizi kontrol edin</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto" />
                </div>
              </Link>
              <Link href="/pricing">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Planlar ve Fiyatlar</h3>
                    <p className="text-xs text-slate-500">Pro plana yükseltin</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto" />
                </div>
              </Link>
            </div>

            {/* Referans */}
            <Link href="/referral" className="mt-4 block">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-4 flex items-center gap-4 text-white hover:shadow-lg transition-all">
                <Gift className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-sm">Arkadaşını Davet Et</h3>
                  <p className="text-xs text-amber-100">Her davet = +1 ücretsiz analiz</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </div>
            </Link>

            {/* Admin Panel Linki */}
            {user && isAdmin(user.email) && (
              <Link href="/admin" className="mt-4 block">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-4 flex items-center gap-4 text-white hover:shadow-lg transition-all">
                  <Shield className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold text-sm">Admin Panel</h3>
                    <p className="text-xs text-red-100">Sınırsız erişim - Yönetim paneli</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Link>
            )}
          </motion.div>
        )}

        {/* Tek Sayfa Analiz Formu */}
        {showWizard && (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setShowWizard(false)} className="text-sm text-slate-500 hover:text-slate-700 mb-6 flex items-center gap-1">
              ← Panele Dön
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Davanızı Anlatın</h2>
                <p className="text-sm text-slate-500">Tüm bilgileri doldurun, AI analiz etsin.</p>
              </div>

              {/* Başlık + Kategori */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Dava Başlığı *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateForm({ title: e.target.value })}
                    placeholder="Örn: İşten haksız çıkarılma"
                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateForm({ category: e.target.value as import("@/types/database").CaseCategory })}
                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="">Seçin</option>
                    {Object.entries(CASE_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Olay Özeti */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Olayınızı Anlatın *</label>
                  {formData.eventSummary.length >= 20 && (
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch("/api/improve-text", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ text: formData.eventSummary, category: formData.category }),
                        });
                        const data = await res.json();
                        if (data.improvedText && confirm("AI düzenleme önerisi:\n\n" + data.improvedText.substring(0, 300) + "...\n\nKabul ediyor musunuz?")) {
                          updateForm({ eventSummary: data.improvedText });
                        }
                      }}
                      className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                    >
                      ✨ AI ile İyileştir
                    </button>
                  )}
                </div>
                <textarea
                  value={formData.eventSummary}
                  onChange={(e) => updateForm({ eventSummary: e.target.value })}
                  placeholder="Ne oldu? Ne zaman oldu? Kim tarafından yapıldı? Hangi kanıtlarınız var? Mümkün olduğunca detaylı yazın."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{formData.eventSummary.length < 20 ? `En az 20 karakter (${formData.eventSummary.length}/20)` : "✓ Yeterli"}</span>
                  <span>{formData.eventSummary.length} karakter</span>
                </div>
              </div>

              {/* Tarih + Karşı Taraf + Ek Not */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Olay Tarihi</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => updateForm({ eventDate: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Karşı Taraf</label>
                  <input
                    type="text"
                    value={formData.opposingParty}
                    onChange={(e) => updateForm({ opposingParty: e.target.value })}
                    placeholder="Kişi veya kurum"
                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Ek Notlar</label>
                  <input
                    type="text"
                    value={formData.additionalNotes}
                    onChange={(e) => updateForm({ additionalNotes: e.target.value })}
                    placeholder="Tanık, belge bilgisi vs."
                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Analiz Butonu */}
              <Button
                onClick={handleSubmit}
                disabled={isAnalyzing || formData.title.length < 3 || !formData.category || formData.eventSummary.length < 20}
                size="lg"
                className="w-full h-13 text-base"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analiz Ediliyor...</>
                ) : (
                  <><Zap className="w-5 h-5 mr-2" /> Analizi Başlat</>
                )}
              </Button>

              <p className="text-[10px] text-slate-400 text-center">
                AI ile emsal kararlar taranacak, kazanma olasılığı hesaplanacak.
              </p>
            </div>

            {/* Loading overlay */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-300 animate-pulse">
                      <Scale className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Davanız Analiz Ediliyor</h3>
                    <p className="text-slate-500">Emsal kararlar taranıyor, hukuki analiz yapılıyor...</p>
                    <div className="mt-6 flex justify-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} className="w-3 h-3 bg-blue-600 rounded-full" animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
