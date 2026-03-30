"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Clock, AlertTriangle, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { getStatuteOfLimitations, type StatuteResult } from "@/lib/statute-of-limitations";

export default function StatuteOfLimitationsPage() {
  const [category, setCategory] = useState<CaseCategory | "">("");
  const [eventDate, setEventDate] = useState("");
  const [result, setResult] = useState<StatuteResult | null>(null);

  const handleCalculate = () => {
    if (!category) return;
    setResult(getStatuteOfLimitations(category as CaseCategory, eventDate || undefined));
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
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-2">Zamanaşımı Hesaplayıcı</h1>
        <p className="text-slate-500 mb-8">Davanızın zamanaşımı sürelerini kontrol edin</p>

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
                <label className="text-sm font-semibold text-slate-700">Olay Tarihi (Opsiyonel)</label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none" />
              </div>
            </div>
            <Button onClick={handleCalculate} size="lg" disabled={!category} className="w-full">
              <Clock className="w-5 h-5 mr-2" /> Zamanaşımını Hesapla
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {result.deadlines.map((d, i) => {
              const statute = result.statutes[i];
              return (
                <Card key={d.subcategory} className={
                  d.isExpired ? "border-red-300 bg-red-50/50" :
                  d.isUrgent ? "border-amber-300 bg-amber-50/50" :
                  "border-slate-200"
                }>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900">{d.subcategory}</h3>
                          {d.isExpired ? (
                            <Badge variant="danger" className="gap-1"><XCircle className="w-3 h-3" /> Süresi Dolmuş</Badge>
                          ) : d.isUrgent ? (
                            <Badge variant="warning" className="gap-1"><AlertTriangle className="w-3 h-3" /> Acil</Badge>
                          ) : (
                            <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Süre Var</Badge>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-slate-400 block text-xs">Zamanaşımı Süresi</span>
                            <span className="font-semibold text-slate-700">{statute.duration}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Son Tarih</span>
                            <span className="font-semibold text-slate-700">{d.deadline}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Kalan Süre</span>
                            <span className={`font-bold ${d.isExpired ? "text-red-600" : d.isUrgent ? "text-amber-600" : "text-emerald-600"}`}>
                              {d.remaining}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{statute.legalBasis} — {statute.description}</span>
                        </div>
                        {statute.warnings.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {statute.warnings.map((w) => (
                              <div key={w} className="flex items-center gap-2 text-xs text-amber-700">
                                <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {w}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mt-6">
              <strong>Uyarı:</strong> Zamanaşımı süreleri genel bilgi niteliğindedir. Özel durumlar, durma ve kesilme halleri süreleri etkileyebilir. Kesin hesaplama için avukata danışınız.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
