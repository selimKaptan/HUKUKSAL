"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Calculator, Gavel, Handshake, TrendingDown, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { calculateMediation, type MediationResult } from "@/lib/mediation-calculator";

export default function MediationPage() {
  const [category, setCategory] = useState<CaseCategory | "">("");
  const [claimAmount, setClaimAmount] = useState("");
  const [duration, setDuration] = useState("12");
  const [hasLawyer, setHasLawyer] = useState(true);
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<MediationResult | null>(null);

  const handleCalculate = () => {
    if (!category || !claimAmount) return;
    const r = calculateMediation({
      category: category as CaseCategory,
      claimAmount: parseFloat(claimAmount),
      estimatedDuration: parseInt(duration),
      hasLawyer,
      complexity,
    });
    setResult(r);
  };

  const fmt = (n: number) => n.toLocaleString("tr-TR") + " TL";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-2">Arabuluculuk Hesaplayıcı</h1>
        <p className="text-slate-500 mb-8">Dava vs Arabuluculuk maliyet ve süre karşılaştırması</p>

        <Card className="mb-8">
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Hukuki Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as CaseCategory)} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none">
                  <option value="">Seçin</option>
                  {Object.entries(CASE_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Talep Tutarı (TL)</label>
                <input type="number" value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} placeholder="100000" className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tahmini Dava Süresi (ay)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Karmaşıklık</label>
                <select value={complexity} onChange={(e) => setComplexity(e.target.value as "low" | "medium" | "high")} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none">
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={hasLawyer} onChange={(e) => setHasLawyer(e.target.checked)} id="lawyer" className="w-5 h-5 rounded border-slate-300 text-blue-600" />
              <label htmlFor="lawyer" className="text-sm font-medium text-slate-700">Avukat ile temsil edilecek</label>
            </div>
            <Button onClick={handleCalculate} size="lg" disabled={!category || !claimAmount} className="w-full">
              <Calculator className="w-5 h-5 mr-2" /> Hesapla
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Karşılaştırma */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Gavel className="w-5 h-5" /> Dava Yolu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-black text-red-600">{fmt(result.lawsuit.totalCost)}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Avukat Ücreti</span><span>{fmt(result.lawsuit.lawyerFee)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Mahkeme Harcı</span><span>{fmt(result.lawsuit.courtFee)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Bilirkişi</span><span>{fmt(result.lawsuit.expertFee)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Diğer</span><span>{fmt(result.lawsuit.otherCosts)}</span></div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Süre: {result.lawsuit.estimatedDuration}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <Handshake className="w-5 h-5" /> Arabuluculuk
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-black text-emerald-600">{fmt(result.mediation.totalCost)}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Arabulucu Ücreti</span><span>{fmt(result.mediation.mediatorFee)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Avukat Ücreti</span><span>{fmt(result.mediation.lawyerFee)}</span></div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Süre: {result.mediation.estimatedDuration}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasarruf */}
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-bold text-blue-800">Tasarruf: {fmt(result.savings)}</span>
                  </div>
                  <Badge variant="success">Süre Farkı: {result.timeSaved}</Badge>
                  <Badge variant={result.recommendation === "mediation" ? "success" : result.recommendation === "lawsuit" ? "danger" : "warning"}>
                    {result.recommendation === "mediation" ? "Arabuluculuk Önerilir" : result.recommendation === "lawsuit" ? "Dava Önerilir" : "Her İkisi Denenebilir"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-slate-700">{result.explanation}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
