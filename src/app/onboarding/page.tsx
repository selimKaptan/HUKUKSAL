"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  SkipForward,
} from "lucide-react";

const steps = [
  {
    title: "Davanızı Anlatın",
    description:
      "Hukuki sorununuzu kendi cümlelerinizle anlatmanız yeterli. Yapay zeka motorumuz, anlattığınız durumu analiz ederek ilgili hukuk alanını, kanun maddelerini ve uygulanabilir yasal süreçleri otomatik olarak belirler.",
    icon: FileText,
    gradient: "from-indigo-600 via-purple-600 to-indigo-700",
    iconBg: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "AI Emsal Taraması",
    description:
      "Gelişmiş yapay zeka teknolojimiz, davanıza benzer binlerce Yargıtay ve istinaf mahkemesi kararını tarayarak en ilgili emsal kararları bulur. Böylece davanızın olası sonucunu önceden görebilirsiniz.",
    icon: Search,
    gradient: "from-emerald-600 via-teal-600 to-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Sonucunuzu Alın",
    description:
      "Detaylı analiz raporunuzda kazanma olasılığı, benzer emsal kararlar, önerilen strateji ve tahmini süre gibi bilgileri görüntüleyin. Raporunuzu PDF olarak indirip avukatınızla paylaşabilirsiniz.",
    icon: BarChart3,
    gradient: "from-amber-500 via-orange-500 to-amber-600",
    iconBg: "bg-amber-100 text-amber-600",
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const completeOnboarding = useCallback(() => {
    localStorage.setItem("jg_onboarded", "true");
    router.push("/dashboard");
  }, [router]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${step.gradient} transition-all duration-700 px-4`}
    >
      {/* Skip button */}
      <button
        onClick={completeOnboarding}
        className="absolute top-6 right-6 flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm font-medium"
      >
        Atla
        <SkipForward className="w-4 h-4" />
      </button>

      {/* Card */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4, type: "spring" }}
              className={`w-20 h-20 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6`}
            >
              <Icon className="w-10 h-10" strokeWidth={1.5} />
            </motion.div>

            {/* Step indicator */}
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Adım {currentStep + 1} / {steps.length}
            </span>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {step.title}
            </h1>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-8">
              {step.description}
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 w-full">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center gap-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Geri
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${step.gradient} text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all`}
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    İleri
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  "Başlayalım!"
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {steps.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: idx === currentStep ? 28 : 10,
                opacity: idx === currentStep ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
              className="h-2.5 rounded-full bg-white cursor-pointer"
              onClick={() => setCurrentStep(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
