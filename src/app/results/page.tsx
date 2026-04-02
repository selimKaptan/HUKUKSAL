"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, RotateCcw, ExternalLink, Database, Wifi, WifiOff, Sparkles, Cpu, Clock, Timer, CalendarDays, Crown } from "lucide-react";
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
import { ProWall, ProBadge } from "@/components/paywall";
import { getUserPlan, canAccess } from "@/lib/feature-gate";
import { useAuth } from "@/lib/auth-context";
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
  const { user } = useAuth();
  const plan = getUserPlan(user);
  const canDownloadPdf = canAccess(plan, "pdf_download");
  const [showProWall, setShowProWall] = useState(false);
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
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Haklarım
            </span>
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

        {/* PDF Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 text-center"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-2">
            Avukat Dosyası Hazır
            {!canDownloadPdf && <ProBadge />}
          </h2>
          <p className="text-slate-500 mb-6 max-w-lg mx-auto">
            {canDownloadPdf
              ? "Analiz raporunuzu, emsal kararları ve önerilerinizi içeren profesyonel dosyayı indirin."
              : "PDF rapor indirmek Pro üyelik gerektirir. Pro'ya geçerek avukat dosyanızı indirin."}
          </p>
          {!canDownloadPdf ? (
            <button
              onClick={() => setShowProWall(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Crown className="w-5 h-5" /> Pro ile PDF İndir
            </button>
          ) : (
          <PDFGenerator
            result={result}
            caseTitle={caseTitle}
            category={CASE_CATEGORY_LABELS[category]}
          />
          )}
        </motion.div>

        <ProWall show={showProWall} onClose={() => setShowProWall(false)} feature="PDF rapor indirmek" />

        {/* Disclaimer */}
        <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-sm text-amber-800">
            <strong>Yasal Uyarı:</strong> Bu analiz bilgilendirme amaçlıdır ve kesin hukuki tavsiye niteliği taşımaz. Mutlaka bir avukata danışın.
          </p>
        </div>
      </div>
    </div>
  );
}
