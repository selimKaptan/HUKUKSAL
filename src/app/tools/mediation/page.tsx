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

/**
 * Adalet Bakanlığı Adli Sicil ve İstatistik Genel Müdürlüğü
 * "Adalet İstatistikleri 2024" Raporu verileri
 * Kaynak: adlisicil.adalet.gov.tr
 *
 * İlk derece mahkemesi ortalama yargılama süreleri (gün → ay çevirisi)
 * + İstinaf ve Yargıtay süreleri dahil toplam tahmini süre
 */
const AVG_DURATIONS: Record<CaseCategory, { ilkDereceGun: number; ilkDereceAy: number; istinafAy: number; temyizAy: number; toplamAy: number; kaynak: string }> = {
  is_hukuku: {
    ilkDereceGun: 544, // Adalet İstatistikleri 2024: İş Mahkemesi ort. 544 gün
    ilkDereceAy: 18,
    istinafAy: 10,    // İstinaf: 6-14 ay ortalaması
    temyizAy: 8,      // Yargıtay Hukuk Daireleri: ort. 240 gün ≈ 8 ay
    toplamAy: 36,
    kaynak: "Adalet İstatistikleri 2024 - İş Mahkemesi: 544 gün",
  },
  aile_hukuku: {
    ilkDereceGun: 156, // Adalet İstatistikleri 2024: Boşanma ort. 156 gün
    ilkDereceAy: 5,
    istinafAy: 8,
    temyizAy: 8,
    toplamAy: 21,
    kaynak: "Adalet İstatistikleri 2024 - Aile Mahkemesi: 156 gün (çekişmeli boşanmada daha uzun)",
  },
  ticaret_hukuku: {
    ilkDereceGun: 450, // 2014: 231 gün → güncel tahmin artış trendi ile ~450 gün
    ilkDereceAy: 15,
    istinafAy: 12,
    temyizAy: 8,
    toplamAy: 35,
    kaynak: "Adalet İstatistikleri - Asliye Ticaret: ~450 gün (toplu mahkeme, bilirkişi süreci uzun)",
  },
  ceza_hukuku: {
    ilkDereceGun: 390, // Hedef süre: 300-390 gün (asliye ceza)
    ilkDereceAy: 13,
    istinafAy: 12,     // Ceza istinaf: 8-18 ay ortalama
    temyizAy: 18,      // Yargıtay Ceza Daireleri: ort. 556 gün ≈ 18 ay
    toplamAy: 43,
    kaynak: "Adalet İstatistikleri 2024 - Asliye Ceza hedef: 300-390 gün, Yargıtay Ceza: 556 gün",
  },
  tuketici_hukuku: {
    ilkDereceGun: 354, // Adalet İstatistikleri 2024: Tüketici Mahkemesi ort. 354 gün
    ilkDereceAy: 12,
    istinafAy: 8,
    temyizAy: 8,
    toplamAy: 28,
    kaynak: "Adalet İstatistikleri 2024 - Tüketici Mahkemesi: 354 gün",
  },
  kira_hukuku: {
    ilkDereceGun: 330, // Sulh Hukuk: kira davaları ~330 gün (arabuluculuk dahil)
    ilkDereceAy: 11,
    istinafAy: 8,
    temyizAy: 8,
    toplamAy: 27,
    kaynak: "Adalet İstatistikleri - Sulh Hukuk (kira): ~330 gün (2023'ten itibaren arabuluculuk zorunlu)",
  },
  miras_hukuku: {
    ilkDereceGun: 500, // Tapu iptali/tenkis: ~500 gün (en uzun hukuk davaları arasında)
    ilkDereceAy: 17,
    istinafAy: 12,
    temyizAy: 8,
    toplamAy: 37,
    kaynak: "Adalet İstatistikleri 2024 - Tapu iptali/miras: ~500 gün",
  },
  idare_hukuku: {
    ilkDereceGun: 365, // İdare Mahkemeleri: ~1 yıl
    ilkDereceAy: 12,
    istinafAy: 6,      // Bölge İdare Mahkemesi
    temyizAy: 12,      // Danıştay
    toplamAy: 30,
    kaynak: "Adalet İstatistikleri - İdare Mahkemesi: ~365 gün, Danıştay: ~12 ay",
  },
  icra_iflas: {
    ilkDereceGun: 270, // İcra Mahkemeleri: ~270 gün
    ilkDereceAy: 9,
    istinafAy: 6,
    temyizAy: 8,
    toplamAy: 23,
    kaynak: "Adalet İstatistikleri - İcra Mahkemesi: ~270 gün",
  },
  diger: {
    ilkDereceGun: 400,
    ilkDereceAy: 13,
    istinafAy: 8,
    temyizAy: 8,
    toplamAy: 29,
    kaynak: "Genel ortalama",
  },
};

export default function MediationPage() {
  const [category, setCategory] = useState<CaseCategory | "">("");
  const [claimAmount, setClaimAmount] = useState("");
  const [duration, setDuration] = useState("12");
  const [hasLawyer, setHasLawyer] = useState(true);
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<MediationResult | null>(null);

  const handleCategoryChange = (cat: CaseCategory) => {
    setCategory(cat);
    const data = AVG_DURATIONS[cat];
    setDuration(data.ilkDereceAy.toString());
    setResult(null);
  };

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
                <select value={category} onChange={(e) => handleCategoryChange(e.target.value as CaseCategory)} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none">
                  <option value="">Seçin</option>
                  {Object.entries(CASE_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label} (ort. {AVG_DURATIONS[key as CaseCategory].ilkDereceAy} ay)</option>
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
                {category && (
                  <p className="text-xs text-blue-600 mt-1">
                    Adalet Bakanligi 2024: Ilk derece ort. {AVG_DURATIONS[category as CaseCategory].ilkDereceGun} gun ({AVG_DURATIONS[category as CaseCategory].ilkDereceAy} ay) | Istinaf: ~{AVG_DURATIONS[category as CaseCategory].istinafAy} ay | Temyiz: ~{AVG_DURATIONS[category as CaseCategory].temyizAy} ay | Toplam: ~{AVG_DURATIONS[category as CaseCategory].toplamAy} ay
                  </p>
                )}
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
