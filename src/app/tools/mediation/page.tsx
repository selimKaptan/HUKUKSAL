"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Calculator, Gavel, Handshake, Clock, Briefcase, Heart, ShoppingCart, AlertTriangle, Home, BookOpen, Building2, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { calculateMediation, type MediationResult } from "@/lib/mediation-calculator";
import { cn } from "@/lib/utils";

const AVG_DURATIONS: Record<CaseCategory, { ilkDereceGun: number; ilkDereceAy: number; istinafAy: number; temyizAy: number; toplamAy: number; kaynak: string; zorunluArabuluculuk: boolean }> = {
  is_hukuku: { ilkDereceGun: 544, ilkDereceAy: 18, istinafAy: 10, temyizAy: 8, toplamAy: 36, kaynak: "Adalet Ist. 2024 - Is Mahkemesi", zorunluArabuluculuk: true },
  aile_hukuku: { ilkDereceGun: 156, ilkDereceAy: 5, istinafAy: 8, temyizAy: 8, toplamAy: 21, kaynak: "Adalet Ist. 2024 - Aile Mahkemesi", zorunluArabuluculuk: false },
  ticaret_hukuku: { ilkDereceGun: 450, ilkDereceAy: 15, istinafAy: 12, temyizAy: 8, toplamAy: 35, kaynak: "Adalet Ist. - Asliye Ticaret", zorunluArabuluculuk: true },
  ceza_hukuku: { ilkDereceGun: 390, ilkDereceAy: 13, istinafAy: 12, temyizAy: 18, toplamAy: 43, kaynak: "Adalet Ist. 2024 - Asliye Ceza", zorunluArabuluculuk: false },
  tuketici_hukuku: { ilkDereceGun: 354, ilkDereceAy: 12, istinafAy: 8, temyizAy: 8, toplamAy: 28, kaynak: "Adalet Ist. 2024 - Tuketici Mahkemesi", zorunluArabuluculuk: true },
  kira_hukuku: { ilkDereceGun: 330, ilkDereceAy: 11, istinafAy: 8, temyizAy: 8, toplamAy: 27, kaynak: "Adalet Ist. - Sulh Hukuk", zorunluArabuluculuk: true },
  miras_hukuku: { ilkDereceGun: 500, ilkDereceAy: 17, istinafAy: 12, temyizAy: 8, toplamAy: 37, kaynak: "Adalet Ist. 2024 - Miras", zorunluArabuluculuk: false },
  idare_hukuku: { ilkDereceGun: 365, ilkDereceAy: 12, istinafAy: 6, temyizAy: 12, toplamAy: 30, kaynak: "Adalet Ist. - Idare Mahkemesi", zorunluArabuluculuk: false },
  icra_iflas: { ilkDereceGun: 270, ilkDereceAy: 9, istinafAy: 6, temyizAy: 8, toplamAy: 23, kaynak: "Adalet Ist. - Icra Mahkemesi", zorunluArabuluculuk: false },
  diger: { ilkDereceGun: 400, ilkDereceAy: 13, istinafAy: 8, temyizAy: 8, toplamAy: 29, kaynak: "Genel ortalama", zorunluArabuluculuk: false },
};

const CATEGORY_ICONS: Record<CaseCategory, React.ElementType> = {
  is_hukuku: Briefcase, aile_hukuku: Heart, ticaret_hukuku: Building2, ceza_hukuku: AlertTriangle,
  tuketici_hukuku: ShoppingCart, kira_hukuku: Home, miras_hukuku: BookOpen, idare_hukuku: Gavel,
  icra_iflas: Scale, diger: BookOpen,
};

export default function MediationPage() {
  const [category, setCategory] = useState<CaseCategory | "">("");
  const [claimAmount, setClaimAmount] = useState("100000");
  const [hasLawyer, setHasLawyer] = useState(true);
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<MediationResult | null>(null);

  const handleCategoryChange = (cat: CaseCategory) => {
    setCategory(cat);
    setResult(null);
  };

  const handleCalculate = () => {
    if (!category || !claimAmount) return;
    const data = AVG_DURATIONS[category as CaseCategory];
    setResult(calculateMediation({
      category: category as CaseCategory,
      claimAmount: parseFloat(claimAmount),
      estimatedDuration: data.ilkDereceAy,
      hasLawyer,
      complexity,
    }));
  };

  const fmt = (n: number) => n.toLocaleString("tr-TR") + " TL";
  const selectedData = category ? AVG_DURATIONS[category as CaseCategory] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Haklarım
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-sm font-medium text-amber-700 mb-4">
            <Handshake className="w-4 h-4" /> Dava mi Arabuluculuk mu?
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Arabuluculuk Hesaplayici</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Dava acmak mi yoksa arabuluculuk mu daha avantajli? Maliyet ve sure karsilastirmasi yapin.</p>
        </div>

        {/* ADIM 1: Kategori Seçimi */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">1. Dava Kategorisi Secin</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Object.keys(CASE_CATEGORY_LABELS) as CaseCategory[]).filter(c => c !== "diger").map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const data = AVG_DURATIONS[cat];
              const isSelected = category === cat;
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  )}
                >
                  <Icon className={cn("w-6 h-6", isSelected ? "text-blue-600" : "text-slate-400")} />
                  <span className={cn("text-xs font-semibold", isSelected ? "text-blue-700" : "text-slate-600")}>{CASE_CATEGORY_LABELS[cat]}</span>
                  <span className="text-[10px] text-slate-400">ort. {data.ilkDereceAy} ay</span>
                  {data.zorunluArabuluculuk && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">ZORUNLU</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Bakanlık İstatistik Kartı */}
        {selectedData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">Adalet Bakanligi 2024 Istatistikleri — {CASE_CATEGORY_LABELS[category as CaseCategory]}</span>
                  {selectedData.zorunluArabuluculuk && (
                    <Badge variant="success" className="text-xs">Zorunlu Arabuluculuk</Badge>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Ilk Derece", value: `${selectedData.ilkDereceGun} gun`, sub: `(${selectedData.ilkDereceAy} ay)`, color: "text-blue-700" },
                    { label: "Istinaf", value: `~${selectedData.istinafAy} ay`, sub: "Bolge Adliye", color: "text-indigo-700" },
                    { label: "Temyiz", value: `~${selectedData.temyizAy} ay`, sub: "Yargitay", color: "text-purple-700" },
                    { label: "Toplam", value: `~${selectedData.toplamAy} ay`, sub: `(${(selectedData.toplamAy / 12).toFixed(1)} yil)`, color: "text-slate-900" },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 bg-white/80 rounded-xl">
                      <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                      <div className="text-[10px] text-slate-400">{item.sub}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-blue-500 mt-3">Kaynak: {selectedData.kaynak}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ADIM 2: Detaylar */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">2. Dava Detaylari</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Talep Tutari (TL)</label>
                  <input type="number" value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} placeholder="100000" className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none text-lg font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Karmasiklik</label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((c) => (
                      <button key={c} onClick={() => setComplexity(c)} className={cn(
                        "flex-1 h-12 rounded-xl border-2 text-sm font-medium transition-all",
                        complexity === c
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      )}>
                        {c === "low" ? "Dusuk" : c === "medium" ? "Orta" : "Yuksek"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Avukat Temsili</label>
                  <div className="flex gap-2">
                    <button onClick={() => setHasLawyer(true)} className={cn(
                      "flex-1 h-12 rounded-xl border-2 text-sm font-medium transition-all",
                      hasLawyer ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"
                    )}>Evet</button>
                    <button onClick={() => setHasLawyer(false)} className={cn(
                      "flex-1 h-12 rounded-xl border-2 text-sm font-medium transition-all",
                      !hasLawyer ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"
                    )}>Hayir</button>
                  </div>
                </div>
              </div>
              <Button onClick={handleCalculate} size="lg" disabled={!category || !claimAmount} className="w-full mt-6">
                <Calculator className="w-5 h-5 mr-2" /> Karsilastirmayi Hesapla
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* SONUÇLAR */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">3. Karsilastirma Sonucu</h2>

            {/* Tavsiye Banner */}
            <div className={cn(
              "rounded-2xl p-6 mb-6 border-2",
              result.recommendation === "mediation" ? "bg-emerald-50 border-emerald-300" :
              result.recommendation === "lawsuit" ? "bg-red-50 border-red-300" :
              "bg-amber-50 border-amber-300"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                  result.recommendation === "mediation" ? "bg-emerald-500" :
                  result.recommendation === "lawsuit" ? "bg-red-500" : "bg-amber-500"
                )}>
                  {result.recommendation === "mediation" ? <Handshake className="w-5 h-5 text-white" /> :
                   result.recommendation === "lawsuit" ? <Gavel className="w-5 h-5 text-white" /> :
                   <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {result.recommendation === "mediation" ? "Arabuluculuk Onerilir" :
                     result.recommendation === "lawsuit" ? "Dava Onerilir" : "Her Ikisi Denenebilir"}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="success">Tasarruf: {fmt(result.savings)}</Badge>
                    <Badge variant="default">Sure Farki: {result.timeSaved}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Karşılaştırma Kartları */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="border-red-200 overflow-hidden">
                <div className="bg-red-500 text-white text-center py-2 text-sm font-bold">DAVA YOLU</div>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-red-600">{fmt(result.lawsuit.totalCost)}</div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {result.lawsuit.estimatedDuration}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between"><span className="text-slate-500">Avukat Ucreti</span><span className="font-semibold">{fmt(result.lawsuit.lawyerFee)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Mahkeme Harci</span><span className="font-semibold">{fmt(result.lawsuit.courtFee)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Bilirkisi</span><span className="font-semibold">{fmt(result.lawsuit.expertFee)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Diger (tebligat, yol...)</span><span className="font-semibold">{fmt(result.lawsuit.otherCosts)}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 overflow-hidden">
                <div className="bg-emerald-500 text-white text-center py-2 text-sm font-bold">ARABULUCULUK</div>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-emerald-600">{fmt(result.mediation.totalCost)}</div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {result.mediation.estimatedDuration}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between"><span className="text-slate-500">Arabulucu Ucreti</span><span className="font-semibold">{fmt(result.mediation.mediatorFee)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Avukat Ucreti</span><span className="font-semibold">{fmt(result.mediation.lawyerFee)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasarruf barı */}
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Maliyet Farki</span>
                  <span className="text-lg font-black text-blue-700">{fmt(result.savings)} tasarruf</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (result.mediation.totalCost / result.lawsuit.totalCost) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>Arabuluculuk: {fmt(result.mediation.totalCost)}</span>
                  <span>Dava: {fmt(result.lawsuit.totalCost)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bilgilendirme */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
          Hesaplamalar Adalet Bakanligi 2024 istatistikleri ve genel tarifeler baz alinarak yapilmaktadir. Kesin maliyet icin avukata danisiniz.
        </div>
      </div>
    </div>
  );
}
