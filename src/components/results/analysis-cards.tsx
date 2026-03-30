"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Scale, TrendingUp, TrendingDown, FileText } from "lucide-react";
import type { AnalysisResult, Precedent } from "@/types/database";

export function StrengthsCard({ strengths }: { strengths: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            Güçlü Yanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700">{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function WeaknessesCard({ weaknesses }: { weaknesses: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Zayıf Yanlar ve Riskler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-3">
                <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700">{w}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PrecedentCard({
  precedent,
  index,
}: {
  precedent: Precedent & { relevance_score: number };
  index: number;
}) {
  const outcomeLabel =
    precedent.outcome === "plaintiff_won"
      ? "Davacı Kazandı"
      : precedent.outcome === "defendant_won"
      ? "Davalı Kazandı"
      : precedent.outcome === "settled"
      ? "Uzlaşma"
      : "Reddedildi";

  const outcomeVariant =
    precedent.outcome === "plaintiff_won"
      ? "success"
      : precedent.outcome === "defendant_won"
      ? "danger"
      : "warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">{precedent.court}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">{precedent.case_number}</p>
              </div>
            </div>
            <Badge variant={outcomeVariant as "success" | "danger" | "warning"}>{outcomeLabel}</Badge>
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
              {precedent.keywords.slice(0, 3).map((kw) => (
                <Badge key={kw} variant="outline" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
            <div className="text-sm font-bold text-blue-600">
              %{Math.round(precedent.relevance_score * 100)} benzerlik
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RecommendationCard({ result }: { result: AnalysisResult }) {
  const isPositive = result.recommendation === "file_case";
  const isNeutral = result.recommendation === "needs_review";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card
        className={`border-2 ${
          isPositive
            ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100"
            : isNeutral
            ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100"
            : "border-red-300 bg-gradient-to-br from-red-50 to-red-100"
        }`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 text-lg ${
              isPositive ? "text-emerald-800" : isNeutral ? "text-amber-800" : "text-red-800"
            }`}
          >
            <FileText className="w-5 h-5" />
            {isPositive
              ? "Dava Açmanız Tavsiye Edilir"
              : isNeutral
              ? "Avukat Değerlendirmesi Gereklidir"
              : "Dava Açmanız Önerilmez"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Önerilen Adımlar:</h4>
              <ul className="space-y-2">
                {result.suggestedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="font-bold text-blue-600">{i + 1}.</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            {result.riskFactors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-2">Risk Faktörleri:</h4>
                <ul className="space-y-1">
                  {result.riskFactors.map((risk, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
