"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scale } from "lucide-react";
import Link from "next/link";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { WizardStep1 } from "@/components/dashboard/wizard-step1";
import { WizardStep2 } from "@/components/dashboard/wizard-step2";
import { useAuth } from "@/lib/auth-context";
import { saveCaseResult } from "@/lib/case-storage";
import { saveCase } from "@/lib/db";
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
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
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
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
          <span className="text-sm text-slate-400 font-medium">Dava Analiz Sihirbazı</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
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
    </div>
  );
}
