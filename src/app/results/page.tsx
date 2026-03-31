"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, RotateCcw, Sparkles, Cpu, Clock, Timer, CalendarDays, Share2, Check, FileText, Gavel, TrendingUp, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface ExtendedResult extends AnalysisResult {
  aiProvider?: "claude" | "local";
}

interface StoredData {
  result: ExtendedResult;
  caseTitle: string;
  category: CaseCategory;
}

type TabId = "overview" | "precedents" | "duration" | "download";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Genel Bakış", icon: TrendingUp },
  { id: "precedents", label: "Emsal Kararlar", icon: Gavel },
  { id: "duration", label: "Süre Tahmini", icon: Timer },
  { id: "download", label: "Dosya İndir", icon: Download },
];

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<StoredData | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const handleShare = async () => {
    const text = data ? `JusticeGuard Analiz: "${data.caseTitle}" - Kazanma Olasılığı: %${data.result.winProbability}` : "";
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: "JusticeGuard Analiz Sonucu", text, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) { setData(JSON.parse(stored)); } else { router.push("/dashboard"); }
  }, [router]);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse text-slate-400">Yükleniyor...</div></div>;
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
            <span className="text-xl font-black text-slate-900 tracking-tight">Justice<span className="text-blue-600">Guard</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              {copied ? <Check className="mr-1 w-4 h-4 text-emerald-500" /> : <Share2 className="mr-1 w-4 h-4" />}
              {copied ? "Kopyalandı" : "Paylaş"}
            </Button>
            <Link href="/dashboard"><Button variant="outline" size="sm"><RotateCcw className="mr-2 w-4 h-4" />Yeni Analiz</Button></Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft className="w-4 h-4" />Panele Dön</Link>

        {/* Başlık + Badge */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 mb-1">{caseTitle}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-slate-500">{CASE_CATEGORY_LABELS[category]} | {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
            {result.aiProvider === "claude" ? (
              <Badge variant="default" className="gap-1 bg-gradient-to-r from-violet-600 to-purple-600 border-0 text-white"><Sparkles className="w-3 h-3" />Claude AI</Badge>
            ) : (
              <Badge variant="outline" className="gap-1"><Cpu className="w-3 h-3" />Yerel AI</Badge>
            )}
          </div>
        </div>

        {/* Gauge + Tavsiye - Her zaman görünür */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 text-center">
            <h2 className="text-sm font-bold text-slate-500 mb-4">Kazanma Olasılığı</h2>
            <GaugeChart value={result.winProbability} size={200} />
          </div>
          <div className="md:col-span-2">
            <RecommendationCard result={result} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all relative",
                  activeTab === tab.id
                    ? "text-blue-700 bg-blue-50/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Tab İçerikleri */}
          <div className="p-6">
            {/* Genel Bakış */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <StrengthsCard strengths={result.strengths} />
                  <WeaknessesCard weaknesses={result.weaknesses} />
                </div>
                {result.riskFactors && result.riskFactors.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <h3 className="text-sm font-bold text-amber-800 mb-2">Risk Faktörleri</h3>
                    <ul className="space-y-1">
                      {result.riskFactors.map((r, i) => (
                        <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.suggestedActions && result.suggestedActions.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="text-sm font-bold text-blue-800 mb-2">Önerilen Adımlar</h3>
                    <ol className="space-y-1">
                      {result.suggestedActions.map((a, i) => (
                        <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="font-bold text-blue-500 flex-shrink-0">{i + 1}.</span>{a}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </motion.div>
            )}

            {/* Emsal Kararlar */}
            {activeTab === "precedents" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Gavel className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">{result.matchedPrecedents.length} Emsal Karar Bulundu</h2>
                  {result.aiProvider === "claude" && (
                    <Badge variant="default" className="gap-1 bg-gradient-to-r from-violet-600 to-purple-600 border-0 text-white text-xs"><Sparkles className="w-3 h-3" />AI Tarama</Badge>
                  )}
                </div>
                {result.matchedPrecedents.map((precedent, index) => (
                  <PrecedentCard key={`${precedent.case_number}-${index}`} precedent={precedent} index={index} />
                ))}
              </motion.div>
            )}

            {/* Süre Tahmini */}
            {activeTab === "duration" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {result.estimatedDuration ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <p className="text-xs text-emerald-600 font-medium mb-1">En Kısa</p>
                        <p className="text-xl font-black text-emerald-700">
                          {result.estimatedDuration.minDays < 30 ? `${result.estimatedDuration.minDays} gün` : result.estimatedDuration.minDays < 365 ? `${Math.round(result.estimatedDuration.minDays / 30)} ay` : `${(result.estimatedDuration.minDays / 365).toFixed(1)} yıl`}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium mb-1">Ortalama</p>
                        <p className="text-2xl font-black text-blue-700">
                          {result.estimatedDuration.avgDays < 30 ? `${result.estimatedDuration.avgDays} gün` : result.estimatedDuration.avgDays < 365 ? `${Math.round(result.estimatedDuration.avgDays / 30)} ay` : `${(result.estimatedDuration.avgDays / 365).toFixed(1)} yıl`}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-xs text-red-600 font-medium mb-1">En Uzun</p>
                        <p className="text-xl font-black text-red-700">
                          {result.estimatedDuration.maxDays < 365 ? `${Math.round(result.estimatedDuration.maxDays / 30)} ay` : `${(result.estimatedDuration.maxDays / 365).toFixed(1)} yıl`}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{result.estimatedDuration.description}</p>

                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Dava Aşamaları</h3>
                      <div className="space-y-2">
                        {result.estimatedDuration.phases.map((phase, i) => (
                          <div key={phase.name} className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-blue-500" : "bg-slate-300"}`} />
                              {i < result.estimatedDuration!.phases.length - 1 && <div className="w-0.5 h-6 bg-slate-200" />}
                            </div>
                            <div className="flex items-center justify-between flex-1 py-1">
                              <span className="text-sm text-slate-700">{phase.name}</span>
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{phase.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {result.estimatedDuration.precedentDurations.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Emsal Dava Süreleri</h3>
                        <div className="grid gap-2">
                          {result.estimatedDuration.precedentDurations.map((pd) => (
                            <div key={pd.case_number} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div><span className="text-sm font-medium text-slate-700">{pd.court}</span><span className="text-xs text-slate-400 ml-2">{pd.case_number}</span></div>
                              <Badge variant="outline" className="font-bold">{pd.duration_label}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-slate-500 py-8">Süre tahmini bilgisi mevcut değil.</p>
                )}
              </motion.div>
            )}

            {/* Dosya İndir */}
            {activeTab === "download" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Avukat Dosyası Hazır</h2>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Analiz raporunuzu, emsal kararları ve önerilerinizi içeren profesyonel dosyayı indirin.
                </p>
                <PDFGenerator result={result} caseTitle={caseTitle} category={CASE_CATEGORY_LABELS[category]} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Yasal Uyarı */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-sm text-amber-800">
            <strong>Yasal Uyarı:</strong> Bu analiz bilgilendirme amaçlıdır ve kesin hukuki tavsiye niteliği taşımaz. Mutlaka bir avukata danışın.
          </p>
        </div>
      </div>
    </div>
  );
}
