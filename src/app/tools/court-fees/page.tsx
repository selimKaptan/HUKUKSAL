"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Calculator, Banknote, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { calculateCourtFees, formatCurrency, type FeeCalculation } from "@/lib/court-fees";

export default function CourtFeesPage() {
  const [category, setCategory] = useState<CaseCategory | "">("");
  const [davaKonusuDeger, setDavaKonusuDeger] = useState("");
  const [isTemyiz, setIsTemyiz] = useState(false);
  const [result, setResult] = useState<FeeCalculation | null>(null);

  const handleCalculate = () => {
    if (!category) return;
    const deger = parseFloat(davaKonusuDeger.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
    setResult(calculateCourtFees(category, deger, isTemyiz));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-2">Mahkeme Harci Hesaplayici</h1>
        <p className="text-slate-500 mb-8">Dava turune gore mahkeme harclarini hesaplayin</p>

        <Card className="mb-8">
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Hukuki Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CaseCategory)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none"
                >
                  <option value="">Secin</option>
                  {Object.entries(CASE_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Dava Konusu Deger (TL)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Orn: 100.000"
                  value={davaKonusuDeger}
                  onChange={(e) => setDavaKonusuDeger(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="temyiz"
                checked={isTemyiz}
                onChange={(e) => setIsTemyiz(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="temyiz" className="text-sm font-medium text-slate-700">
                Temyiz / istinaf harci dahil edilsin
              </label>
            </div>
            <Button onClick={handleCalculate} size="lg" disabled={!category} className="w-full">
              <Calculator className="w-5 h-5 mr-2" /> Harclari Hesapla
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Banknote className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Harc Detaylari</h2>
              <Badge variant="outline" className="ml-auto">
                {CASE_CATEGORY_LABELS[result.category as CaseCategory] || result.category}
              </Badge>
            </div>

            {result.davaKonusuDeger > 0 && (
              <div className="text-sm text-slate-500 mb-2">
                Dava konusu deger: <span className="font-semibold text-slate-700">{formatCurrency(result.davaKonusuDeger)} TL</span>
              </div>
            )}

            {result.fees.map((fee, i) => (
              <motion.div
                key={`${fee.type}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={fee.amount === 0 ? "border-slate-200 bg-slate-50/50" : "border-slate-200"}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-900">{fee.name}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{fee.description}</p>
                      </div>
                      <div className="text-right">
                        {fee.amount === 0 ? (
                          <Badge variant="success">Muaf</Badge>
                        ) : (
                          <span className="text-lg font-black text-slate-900">
                            {formatCurrency(fee.amount)} TL
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Toplam */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Toplam Tahmini Harc</h3>
                    <p className="text-sm text-slate-500">Pesin odenecek toplam tutar</p>
                  </div>
                  <span className="text-2xl font-black text-blue-700">
                    {formatCurrency(result.totalAmount)} TL
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notlar */}
            {result.notes.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-base font-bold text-amber-800 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Onemli Bilgiler ve Muafiyetler
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <ul className="space-y-2">
                    {result.notes.map((note, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 mt-6">
              <strong>Uyari:</strong> Bu hesaplama bilgi amaclidir ve kesin tutar niteliginde degildir.
              Guncel harc tutarlari icin adliye veznesine veya avukatiniza danisiniz.
              492 sayili Harclar Kanunu ve yillik harc tarifesi esas alinmistir.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
