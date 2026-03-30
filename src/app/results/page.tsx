"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GaugeChart } from "@/components/ui/gauge-chart";
import {
  StrengthsCard,
  WeaknessesCard,
  PrecedentCard,
  RecommendationCard,
} from "@/components/results/analysis-cards";
import { PDFGenerator } from "@/components/results/pdf-generator";
import { CASE_CATEGORY_LABELS } from "@/types/database";
import type { AnalysisResult, CaseCategory } from "@/types/database";

interface StoredData {
  result: AnalysisResult;
  caseTitle: string;
  category: CaseCategory;
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<StoredData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  const { result, caseTitle, category } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <RotateCcw className="mr-2 w-4 h-4" />
              Yeni Analiz
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Sihirbaza Dön
        </Link>

        {/* Case info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-slate-900 mb-2">{caseTitle}</h1>
          <p className="text-slate-500">
            {CASE_CATEGORY_LABELS[category]} | Analiz Tarihi:{" "}
            {new Date().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </motion.div>

        {/* Gauge Chart - Main result */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-10 mb-8 text-center"
        >
          <h2 className="text-lg font-bold text-slate-600 mb-6">Kazanma Olasılığı</h2>
          <GaugeChart value={result.winProbability} />
        </motion.div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <StrengthsCard strengths={result.strengths} />
          <WeaknessesCard weaknesses={result.weaknesses} />
        </div>

        {/* Recommendation */}
        <div className="mb-8">
          <RecommendationCard result={result} />
        </div>

        {/* Precedent Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Emsal Karar Analizi</h2>
          <div className="grid gap-6">
            {result.matchedPrecedents.map((precedent, index) => (
              <PrecedentCard
                key={precedent.case_number}
                precedent={precedent}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* PDF Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 text-center"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Avukat Dosyası Hazır
          </h2>
          <p className="text-slate-500 mb-6 max-w-lg mx-auto">
            Analiz raporunuzu, emsal kararları ve önerilerinizi içeren profesyonel
            dosyayı indirin. Avukatınıza bu dosyayla gidin.
          </p>
          <PDFGenerator
            result={result}
            caseTitle={caseTitle}
            category={CASE_CATEGORY_LABELS[category]}
          />
        </motion.div>

        {/* Disclaimer */}
        <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-sm text-amber-800">
            <strong>Yasal Uyarı:</strong> Bu analiz bilgilendirme amaçlıdır ve
            kesin hukuki tavsiye niteliği taşımaz. Davanız için mutlaka bir
            avukata danışmanız önerilir.
          </p>
        </div>
      </div>
    </div>
  );
}
