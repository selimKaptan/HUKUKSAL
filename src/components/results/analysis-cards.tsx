"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Scale, TrendingUp, TrendingDown, FileText, ChevronDown, Loader2, Clock, BookOpen, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
import type { AnalysisResult, Precedent } from "@/types/database";

export function StrengthsCard({ strengths }: { strengths: string[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader><CardTitle className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="w-5 h-5" /> Güçlü Yanlar</CardTitle></CardHeader>
        <CardContent><ul className="space-y-3">{strengths.map((s, i) => (<li key={i} className="flex items-start gap-3"><TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span className="text-sm text-slate-700">{s}</span></li>))}</ul></CardContent>
      </Card>
    </motion.div>
  );
}

export function WeaknessesCard({ weaknesses }: { weaknesses: string[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
        <CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><AlertTriangle className="w-5 h-5" /> Zayıf Yanlar ve Riskler</CardTitle></CardHeader>
        <CardContent><ul className="space-y-3">{weaknesses.map((w, i) => (<li key={i} className="flex items-start gap-3"><TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /><span className="text-sm text-slate-700">{w}</span></li>))}</ul></CardContent>
      </Card>
    </motion.div>
  );
}

export function PrecedentCard({ precedent, index }: { precedent: Precedent & { relevance_score: number }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const outcomeLabel = precedent.outcome === "plaintiff_won" ? "Davacı Kazandı" : precedent.outcome === "defendant_won" ? "Davalı Kazandı" : precedent.outcome === "settled" ? "Uzlaşma" : "Reddedildi";
  const outcomeVariant = precedent.outcome === "plaintiff_won" ? "success" : precedent.outcome === "defendant_won" ? "danger" : "warning";

  const handleExpand = async () => {
    setExpanded(!expanded);
    if (!expanded && !detail) {
      setLoadingDetail(true);
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: `Bu emsal karar hakkinda detayli bilgi ver:\n\nMahkeme: ${precedent.court}\nKarar No: ${precedent.case_number}\nOzet: ${precedent.summary}\nKarar: ${precedent.ruling}\n\n1. Bu kararin onemi\n2. Hangi durumlarda referans gosterilir\n3. Hukuki dayanaklari\n4. Benzer davalara etkisi\n\nKisa yaz (max 150 kelime).` }]
          }),
        });
        const data = await res.json();
        setDetail(data.reply || "Detay alınamadı.");
      } catch { setDetail("Bağlantı hatası."); }
      finally { setLoadingDetail(false); }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.1 }}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleExpand}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Scale className="w-5 h-5 text-white" /></div>
              <div><CardTitle className="text-base">{precedent.court}</CardTitle><p className="text-xs text-slate-500 mt-0.5">{precedent.case_number}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={outcomeVariant as "success" | "danger" | "warning"}>{outcomeLabel}</Badge>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">{precedent.summary}</p>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-500 mb-1">KARAR</p>
            <p className="text-sm text-slate-700">{precedent.ruling}</p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2 flex-wrap">
              {precedent.keywords.slice(0, 3).map((kw) => (<Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>))}
              {precedent.duration_days && (
                <Badge variant="outline" className="text-xs gap-1"><Clock className="w-3 h-3" />{precedent.duration_days > 365 ? `${(precedent.duration_days / 365).toFixed(1)} yil` : `${Math.round(precedent.duration_days / 30)} ay`}</Badge>
              )}
            </div>
            <div className="text-sm font-bold text-blue-600">%{Math.round(precedent.relevance_score * 100)} benzerlik</div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="mt-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-violet-600" /><span className="text-sm font-bold text-violet-800">AI Detaylı Analiz</span></div>
                  {loadingDetail ? (
                    <div className="flex items-center gap-2 text-sm text-violet-600 py-4 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Emsal karar analiz ediliyor...</div>
                  ) : detail ? (
                    <div className="text-sm leading-relaxed prose prose-sm prose-slate max-w-none prose-headings:text-sm prose-headings:font-bold prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-slate-900">
                      <Markdown>{detail}</Markdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-violet-600"><BookOpen className="w-4 h-4" /> Detay yüklenemedi.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!expanded && <p className="text-[10px] text-blue-500 text-center pt-1">Detaylı bilgi için tıklayın</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RecommendationCard({ result }: { result: AnalysisResult }) {
  const isPositive = result.recommendation === "file_case";
  const isNeutral = result.recommendation === "needs_review";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <Card className={`border-2 ${isPositive ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100" : isNeutral ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100" : "border-red-300 bg-gradient-to-br from-red-50 to-red-100"}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg ${isPositive ? "text-emerald-800" : isNeutral ? "text-amber-800" : "text-red-800"}`}>
            <FileText className="w-5 h-5" />
            {isPositive ? "Dava Açmanız Tavsiye Edilir" : isNeutral ? "Avukat Değerlendirmesi Gereklidir" : "Dava Açmanız Önerilmez"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Önerilen Adımlar:</h4>
              <ul className="space-y-2">{result.suggestedActions.map((action, i) => (<li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="font-bold text-blue-600">{i + 1}.</span> {action}</li>))}</ul>
            </div>
            {result.riskFactors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-2">Risk Faktörleri:</h4>
                <ul className="space-y-1">{result.riskFactors.map((risk, i) => (<li key={i} className="flex items-center gap-2 text-sm text-red-600"><AlertTriangle className="w-3 h-3" /> {risk}</li>))}</ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
