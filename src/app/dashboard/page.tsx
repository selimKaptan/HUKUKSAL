"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, FileSearch, History, Calculator, Clock, UserSearch, CreditCard, ArrowRight, LogOut, MessageCircle, Shield, Mail, Gift, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalysisForm } from "@/components/dashboard/analysis-form";
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
          userId: user?.id,
          userEmail: user?.email,
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
            <Link href="/settings"><button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><Settings className="w-4 h-4 text-slate-500" /></button></Link>
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

        {/* Analiz Formu */}
        {showWizard && (
          <AnalysisForm
            formData={formData}
            updateForm={updateForm}
            isAnalyzing={isAnalyzing}
            onSubmit={handleSubmit}
            onBack={() => setShowWizard(false)}
          />
        )}

      </div>
    </div>
  );
}
