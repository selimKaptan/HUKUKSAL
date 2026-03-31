"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, FileSearch, History, Calculator, Clock, UserSearch, CreditCard, ArrowRight, LogOut, MessageCircle, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { WizardStep1 } from "@/components/dashboard/wizard-step1";
import { WizardStep2 } from "@/components/dashboard/wizard-step2";
import { useAuth } from "@/lib/auth-context";
import { saveCaseResult } from "@/lib/case-storage";
import { saveCase } from "@/lib/db";
import { canMakeAnalysis, incrementAnalysisUsage, isAdmin } from "@/lib/subscription";
import { WizardStep3 } from "@/components/dashboard/wizard-step3";
import type { CaseCategory } from "@/types/database";

interface FormData {
  title: string;
  category: CaseCategory | "";
  eventSummary: string;
  eventDate: string;
  opposingParty: string;
  additionalNotes: string;
}

const STEPS = ["Dava Bilgileri", "Olay Detayı", "Belgeler & Analiz"];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse text-slate-400">Yukleniyor...</div></div>;
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
          <div className="flex items-center gap-3">
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
              <h1 className="text-3xl font-black text-slate-900 mb-1">Hosgeldin, {user.name || "Kullanici"}!</h1>
              <p className="text-slate-500">Davanizi analiz edin, haklarinizi ogrenin.</p>
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
                  <p className="text-xs text-slate-500">Onceki analizlerinizi goruntuleyin</p>
                </div>
              </Link>
              <Link href="/tools/find-lawyer">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group">
                  <UserSearch className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 mb-1">Avukat Bul</h3>
                  <p className="text-xs text-slate-500">Uzman avukatlarla eslesin</p>
                </div>
              </Link>
              <Link href="/tools/mediation">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer group">
                  <Calculator className="w-8 h-8 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 mb-1">Arabuluculuk</h3>
                  <p className="text-xs text-slate-500">Maliyet karsilastirmasi yapin</p>
                </div>
              </Link>
              <Link href="/ask">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-violet-200 transition-all cursor-pointer group">
                  <MessageCircle className="w-8 h-8 text-violet-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 mb-1">Hukuk Danismani</h3>
                  <p className="text-xs text-slate-500">AI&apos;a soru sorun</p>
                </div>
              </Link>
            </div>

            {/* Alt Araçlar */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/tools/statute-of-limitations">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                  <Clock className="w-6 h-6 text-slate-400" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Zamanasimi Hesaplayici</h3>
                    <p className="text-xs text-slate-500">Surelerinizi kontrol edin</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto" />
                </div>
              </Link>
              <Link href="/pricing">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Planlar ve Fiyatlar</h3>
                    <p className="text-xs text-slate-500">Pro plana yukseltin</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto" />
                </div>
              </Link>
            </div>

            {/* Admin Panel Linki */}
            {user && isAdmin(user.email) && (
              <Link href="/admin" className="mt-4 block">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-4 flex items-center gap-4 text-white hover:shadow-lg transition-all">
                  <Shield className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold text-sm">Admin Panel</h3>
                    <p className="text-xs text-red-100">Sinirsiz erisim - Yonetim paneli</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              </Link>
            )}
          </motion.div>
        )}

        {/* Wizard */}
        {showWizard && (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => { setShowWizard(false); setCurrentStep(0); }} className="text-sm text-slate-500 hover:text-slate-700 mb-6 flex items-center gap-1">
              ← Panele Don
            </button>

            {/* Progress Steps */}
            <ProgressSteps steps={STEPS} currentStep={currentStep} />

        {/* Wizard Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 md:p-10">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <WizardStep1
                key="step1"
                title={formData.title}
                category={formData.category}
                onUpdate={updateForm}
                onNext={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 1 && (
              <WizardStep2
                key="step2"
                eventSummary={formData.eventSummary}
                eventDate={formData.eventDate}
                opposingParty={formData.opposingParty}
                category={formData.category}
                onUpdate={updateForm}
                onNext={() => setCurrentStep(2)}
                onBack={() => setCurrentStep(0)}
              />
            )}
            {currentStep === 2 && (
              <WizardStep3
                key="step3"
                additionalNotes={formData.additionalNotes}
                onUpdate={updateForm}
                onBack={() => setCurrentStep(1)}
                onSubmit={handleSubmit}
                isAnalyzing={isAnalyzing}
              />
            )}
          </AnimatePresence>
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
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-300 animate-pulse">
                  <Scale className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Davanız Analiz Ediliyor
                </h3>
                <p className="text-slate-500">
                  Emsal kararlar taranıyor, hukuki analiz yapılıyor...
                </p>
                <div className="mt-6 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-blue-600 rounded-full"
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.15,
                        repeat: Infinity,
                      }}
                    />
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
