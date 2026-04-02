"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Flame, Lightbulb, Crown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { WizardStep1 } from "@/components/dashboard/wizard-step1";
import { WizardStep2 } from "@/components/dashboard/wizard-step2";
import { useAuth } from "@/lib/auth-context";
import { saveCaseResult } from "@/lib/case-storage";
import { saveCase } from "@/lib/db";
import { WizardStep3 } from "@/components/dashboard/wizard-step3";
import { LimitWall, ProBadge } from "@/components/paywall";
import { getUserPlan, canDoAnalysis, incrementAnalysisCount } from "@/lib/feature-gate";
import { getTodaysTip, updateStreak } from "@/lib/daily-tips";
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
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    eventSummary: "",
    eventDate: "",
    opposingParty: "",
    additionalNotes: "",
  });
  const [showLimitWall, setShowLimitWall] = useState(false);
  const [streak, setStreak] = useState({ currentStreak: 0, totalVisits: 0, longestStreak: 0, lastVisitDate: "" });
  const tip = getTodaysTip();
  const plan = getUserPlan(user);
  const analysisStatus = canDoAnalysis(plan);

  // Guest mode - login olmadan kullanıma izin ver
  useEffect(() => {
    if (!authLoading) {
      const s = updateStreak();
      setStreak(s);
    }
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  const updateForm = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    // Analiz limiti kontrolü
    const status = canDoAnalysis(plan);
    if (!status.allowed) {
      setShowLimitWall(true);
      return;
    }

    setIsAnalyzing(true);
    setStreamStatus("Analiz başlatılıyor...");
    try {
      // Streaming endpoint'i dene, başarısız olursa normal endpoint'e düş
      let result;
      try {
        result = await new Promise((resolve, reject) => {
          const payload = JSON.stringify({
            eventSummary: formData.eventSummary,
            category: formData.category,
            additionalNotes: formData.additionalNotes,
          });

          fetch("/api/analyze-stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          }).then((res) => {
            if (!res.ok || !res.body) {
              reject(new Error("Stream failed"));
              return;
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            function read(): Promise<void> {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  reject(new Error("Stream ended without result"));
                  return;
                }
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("event: ")) {
                    const eventType = line.slice(7);
                    const dataLine = lines[lines.indexOf(line) + 1];
                    if (dataLine?.startsWith("data: ")) {
                      try {
                        const data = JSON.parse(dataLine.slice(6));
                        if (eventType === "step") {
                          setStreamStatus(data.message);
                        } else if (eventType === "keywords") {
                          setStreamStatus(`Arama: ${data.keywords.join(", ")}`);
                        } else if (eventType === "uyap") {
                          setStreamStatus(`${data.count} UYAP emsal bulundu`);
                        } else if (eventType === "result") {
                          resolve(data);
                          return;
                        } else if (eventType === "error") {
                          reject(new Error(data.message));
                          return;
                        }
                      } catch { /* parse error, continue */ }
                    }
                  }
                }
                return read();
              });
            }
            read().catch(reject);
          }).catch(reject);
        });
      } catch {
        // Streaming başarısız, normal endpoint
        setStreamStatus("Analiz yapılıyor...");
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
        result = await response.json();
      }

      // Analiz sayacını artır
      incrementAnalysisCount();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Haklarım
            </span>
          </Link>
          <span className="text-sm text-slate-400 font-medium">Dava Analiz Sihirbazı</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Günlük İpucu + Streak */}
        <div className="grid md:grid-cols-[1fr_auto] gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-amber-600 mb-0.5">Günün Hukuk İpucu — {tip.category}</p>
              <p className="text-sm font-bold text-slate-900 mb-1">{tip.title}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{tip.content}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex md:flex-col items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-black text-slate-900">{streak.currentStreak}</span>
            </div>
            <p className="text-xs text-slate-500 text-center">gün seri</p>
            {plan !== "pro" && (
              <div className="text-center">
                <p className="text-xs text-blue-600 font-semibold">{analysisStatus.remaining}/{analysisStatus.limit}</p>
                <p className="text-[10px] text-slate-400">analiz hakkı</p>
              </div>
            )}
            {plan === "pro" && <ProBadge />}
          </motion.div>
        </div>

        {/* Login bilgilendirme */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-blue-900">Aylık 3 ücretsiz analiz hakkınız var</p>
              <p className="text-xs text-blue-600">Giriş yapın, analiz geçmişiniz kaydedilsin</p>
            </div>
            <Link href="/auth/login">
              <button className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-1">
                Giriş Yap <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </motion.div>
        )}

        {/* Pro upsell for free users */}
        {user && plan === "free" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-indigo-900">Pro ile sınırsız analiz + PDF indirme</p>
                <p className="text-xs text-indigo-600">AI sohbet, belge analizi ve daha fazlası</p>
              </div>
            </div>
            <Link href="/pricing">
              <button className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Pro <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </motion.div>
        )}

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
                  {streamStatus || "Emsal kararlar taranıyor, hukuki analiz yapılıyor..."}
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

      {/* Paywall modal */}
      <LimitWall show={showLimitWall} onClose={() => setShowLimitWall(false)} limitType="analiz" resetInfo="ay başında" />
    </div>
  );
}
