"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, RotateCcw, ExternalLink, Database, Wifi, WifiOff, Sparkles, Cpu, Clock, Timer, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { UyapDecision } from "@/lib/uyap-client";

interface ExtendedResult extends AnalysisResult {
  uyapPrecedents?: UyapDecision[];
  uyapAvailable?: boolean;
  uyapError?: string | null;
  uyapTotalCount?: number;
  aiProvider?: "claude" | "local";
}

interface StoredData {
  result: ExtendedResult;
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
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-slate-500">
              {CASE_CATEGORY_LABELS[category]} | Analiz Tarihi:{" "}
              {new Date().toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {result.aiProvider === "claude" ? (
              <Badge variant="default" className="gap-1 bg-gradient-to-r from-violet-600 to-purple-600 border-0 text-white">
                <Sparkles className="w-3 h-3" />
                Claude AI
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Cpu className="w-3 h-3" />
                Yerel AI
              </Badge>
            )}
            {result.uyapAvailable ? (
              <Badge variant="success" className="gap-1">
                <Wifi className="w-3 h-3" />
                UYAP Aktif
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1">
                <WifiOff className="w-3 h-3" />
                Yerel DB
              </Badge>
            )}
          </div>
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

        {/* Tahmini Dava Süresi */}
        {result.estimatedDuration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Tahmini Dava Süresi</h2>
                <p className="text-xs text-slate-500">Emsal kararlara ve istatistiklere dayalı</p>
              </div>
            </div>

            {/* Süre özeti - 3 kutu */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-600 font-medium mb-1">En Kısa</p>
                <p className="text-xl font-black text-emerald-700">
                  {result.estimatedDuration.minDays < 30
                    ? `${result.estimatedDuration.minDays} gün`
                    : result.estimatedDuration.minDays < 365
                    ? `${Math.round(result.estimatedDuration.minDays / 30)} ay`
                    : `${(result.estimatedDuration.minDays / 365).toFixed(1)} yıl`}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-1">Ortalama</p>
                <p className="text-2xl font-black text-blue-700">
                  {result.estimatedDuration.avgDays < 30
                    ? `${result.estimatedDuration.avgDays} gün`
                    : result.estimatedDuration.avgDays < 365
                    ? `${Math.round(result.estimatedDuration.avgDays / 30)} ay`
                    : `${(result.estimatedDuration.avgDays / 365).toFixed(1)} yıl`}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-xs text-red-600 font-medium mb-1">En Uzun</p>
                <p className="text-xl font-black text-red-700">
                  {result.estimatedDuration.maxDays < 365
                    ? `${Math.round(result.estimatedDuration.maxDays / 30)} ay`
                    : `${(result.estimatedDuration.maxDays / 365).toFixed(1)} yıl`}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">{result.estimatedDuration.description}</p>

            {/* Dava Aşamaları Timeline */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Dava Aşamaları
              </h3>
              <div className="space-y-2">
                {result.estimatedDuration.phases.map((phase, i) => (
                  <div key={phase.name} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-blue-500" : "bg-slate-300"}`} />
                      {i < result.estimatedDuration!.phases.length - 1 && (
                        <div className="w-0.5 h-6 bg-slate-200" />
                      )}
                    </div>
                    <div className="flex items-center justify-between flex-1 py-1">
                      <span className="text-sm text-slate-700">{phase.name}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{phase.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emsal Dava Süreleri */}
            {result.estimatedDuration.precedentDurations.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Emsal Davaların Süreleri
                </h3>
                <div className="grid gap-2">
                  {result.estimatedDuration.precedentDurations.map((pd) => (
                    <div key={pd.case_number} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-slate-700">{pd.court}</span>
                        <span className="text-xs text-slate-400 ml-2">{pd.case_number}</span>
                      </div>
                      <Badge variant="outline" className="font-bold">
                        {pd.duration_label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <StrengthsCard strengths={result.strengths} />
          <WeaknessesCard weaknesses={result.weaknesses} />
        </div>

        {/* Recommendation */}
        <div className="mb-8">
          <RecommendationCard result={result} />
        </div>

        {/* UYAP Gerçek Emsal Kararlar */}
        {result.uyapPrecedents && result.uyapPrecedents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                UYAP Emsal Kararları
              </h2>
              <Badge variant="success" className="gap-1">
                <Database className="w-3 h-3" />
                emsal.uyap.gov.tr
              </Badge>
              {result.uyapTotalCount && result.uyapTotalCount > 0 && (
                <span className="text-sm text-slate-500">
                  ({result.uyapTotalCount} sonuç bulundu)
                </span>
              )}
            </div>
            <div className="grid gap-4">
              {result.uyapPrecedents.map((decision, index) => (
                <motion.div
                  key={decision.karar_id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Database className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {decision.mahkeme || "Mahkeme Bilgisi"}
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {decision.esas_no && `E: ${decision.esas_no}`}
                              {decision.karar_no && ` | K: ${decision.karar_no}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="gap-1 text-xs">
                            UYAP Resmi
                          </Badge>
                          {decision.karar_tarihi && (
                            <span className="text-xs text-slate-400">
                              {decision.karar_tarihi}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {decision.ozet && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">
                          {decision.ozet.length > 500
                            ? decision.ozet.substring(0, 500) + "..."
                            : decision.ozet}
                        </p>
                      )}
                      {decision.metin && !decision.ozet && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">
                          {decision.metin.length > 500
                            ? decision.metin.substring(0, 500) + "..."
                            : decision.metin}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">
                          Kaynak: emsal.uyap.gov.tr
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* UYAP erişilemedi bildirimi */}
        {!result.uyapAvailable && result.uyapError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">
                  UYAP Emsal Karar Sistemi
                </p>
                <p className="text-sm text-blue-700">
                  {result.uyapError} Aşağıda yerel emsal veritabanımızdaki eşleşmeler gösterilmektedir.
                  Gerçek emsal kararlar için{" "}
                  <a
                    href="https://emsal.uyap.gov.tr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-blue-900"
                  >
                    emsal.uyap.gov.tr
                  </a>
                  {" "}adresini ziyaret edebilirsiniz.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Yerel Emsal Kararlar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {result.uyapAvailable ? "Yerel Emsal Eşleşmeleri" : "Emsal Karar Analizi"}
            </h2>
            <Badge variant="outline" className="gap-1">
              <Database className="w-3 h-3" />
              Yerel DB
            </Badge>
          </div>
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
