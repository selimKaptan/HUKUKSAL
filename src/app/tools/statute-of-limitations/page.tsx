"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ArrowLeft, Clock, AlertTriangle, CheckCircle2, XCircle, BookOpen, Calendar, Briefcase, Heart, ShoppingCart, Home, Building2, Gavel, Timer, Shield, ChevronDown, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { getStatuteOfLimitations, type StatuteResult } from "@/lib/statute-of-limitations";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<CaseCategory, React.ElementType> = {
  is_hukuku: Briefcase, aile_hukuku: Heart, ticaret_hukuku: Building2, ceza_hukuku: AlertTriangle,
  tuketici_hukuku: ShoppingCart, kira_hukuku: Home, miras_hukuku: BookOpen, idare_hukuku: Gavel,
  icra_iflas: Scale, diger: BookOpen,
};

export default function StatuteOfLimitationsPage() {
  const [category, setCategory] = useState<CaseCategory | "">("");
  const [eventDate, setEventDate] = useState("");
  const [result, setResult] = useState<StatuteResult | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleCategoryChange = (cat: CaseCategory) => {
    setCategory(cat);
    setResult(null);
  };

  const handleCalculate = () => {
    if (!category) return;
    setResult(getStatuteOfLimitations(category as CaseCategory, eventDate || undefined));
  };

  const expiredCount = result?.deadlines.filter(d => d.isExpired).length || 0;
  const urgentCount = result?.deadlines.filter(d => d.isUrgent && !d.isExpired).length || 0;
  const safeCount = result?.deadlines.filter(d => !d.isExpired && !d.isUrgent).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Justice<span className="text-blue-600">Guard</span></span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-sm font-medium text-orange-700 mb-4">
            <Timer className="w-4 h-4" /> Surelerinizi Kacirmayin
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Zamanasimi Hesaplayici</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Davanizin zamanasimi surelerini kontrol edin. Sureniz dolduysa dava hakkini kaybedebilirsiniz.</p>
        </div>

        {/* ADIM 1: Kategori Seçimi */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">1. Dava Kategorisi Secin</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Object.keys(CASE_CATEGORY_LABELS) as CaseCategory[]).filter(c => c !== "diger").map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const isSelected = category === cat;
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  )}
                >
                  <Icon className={cn("w-6 h-6", isSelected ? "text-blue-600" : "text-slate-400")} />
                  <span className={cn("text-xs font-semibold", isSelected ? "text-blue-700" : "text-slate-600")}>{CASE_CATEGORY_LABELS[cat]}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ADIM 2: Tarih ve Hesapla */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">2. Olay Tarihini Girin</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-5 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Olay Tarihi</label>
                  <p className="text-xs text-slate-400">Tarih girerseniz kalan sureyi hesaplar. Girmezseniz genel bilgi gosterir.</p>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <Button onClick={handleCalculate} size="lg" disabled={!category} className="h-12">
                  <Clock className="w-5 h-5 mr-2" /> Zamanasimini Hesapla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SONUÇLAR */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">3. Zamanasimi Sureleri</h2>

            {/* Özet Kartları */}
            {eventDate && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={cn("rounded-xl p-4 text-center border-2", expiredCount > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200")}>
                  <XCircle className={cn("w-6 h-6 mx-auto mb-1", expiredCount > 0 ? "text-red-500" : "text-slate-300")} />
                  <div className={cn("text-2xl font-black", expiredCount > 0 ? "text-red-600" : "text-slate-300")}>{expiredCount}</div>
                  <div className="text-xs text-slate-500">Suresi Dolmus</div>
                </div>
                <div className={cn("rounded-xl p-4 text-center border-2", urgentCount > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200")}>
                  <AlertTriangle className={cn("w-6 h-6 mx-auto mb-1", urgentCount > 0 ? "text-amber-500" : "text-slate-300")} />
                  <div className={cn("text-2xl font-black", urgentCount > 0 ? "text-amber-600" : "text-slate-300")}>{urgentCount}</div>
                  <div className="text-xs text-slate-500">Acil (&lt;90 gun)</div>
                </div>
                <div className={cn("rounded-xl p-4 text-center border-2", safeCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200")}>
                  <CheckCircle2 className={cn("w-6 h-6 mx-auto mb-1", safeCount > 0 ? "text-emerald-500" : "text-slate-300")} />
                  <div className={cn("text-2xl font-black", safeCount > 0 ? "text-emerald-600" : "text-slate-300")}>{safeCount}</div>
                  <div className="text-xs text-slate-500">Sure Var</div>
                </div>
              </div>
            )}

            {/* Detay Kartları */}
            <div className="space-y-3">
              {result.deadlines.map((d, i) => {
                const statute = result.statutes[i];
                const isExpired = d.isExpired;
                const isUrgent = d.isUrgent;

                return (
                  <motion.div
                    key={d.subcategory}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      className={cn(
                        "overflow-hidden transition-all hover:shadow-md cursor-pointer",
                        isExpired ? "border-red-300" : isUrgent ? "border-amber-300" : "border-slate-200"
                      )}
                      onClick={() => setExpandedCard(expandedCard === d.subcategory ? null : d.subcategory)}
                    >
                      <div className={cn(
                        "h-1",
                        isExpired ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-base font-bold text-slate-900">{d.subcategory}</h3>
                              {isExpired ? (
                                <Badge variant="danger" className="gap-1"><XCircle className="w-3 h-3" /> Suresi Dolmus!</Badge>
                              ) : isUrgent ? (
                                <Badge variant="warning" className="gap-1"><AlertTriangle className="w-3 h-3" /> Acil</Badge>
                              ) : d.daysRemaining === 99999 ? (
                                <Badge variant="default" className="gap-1"><Shield className="w-3 h-3" /> Suresiz</Badge>
                              ) : (
                                <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Guvenli</Badge>
                              )}
                            </div>

                            {/* Süre barı */}
                            {eventDate && d.daysRemaining > 0 && d.daysRemaining < 99999 && (
                              <div className="mb-3">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(5, Math.min(100, 100 - (d.daysRemaining / (statute.durationMonths * 30)) * 100))}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                    className={cn("h-full rounded-full",
                                      isUrgent ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="grid md:grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-500">Sure:</span>
                                <span className="font-semibold text-slate-700">{statute.duration}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-500">Son Tarih:</span>
                                <span className="font-semibold text-slate-700">{d.deadline}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Timer className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-500">Kalan:</span>
                                <span className={cn("font-bold",
                                  isExpired ? "text-red-600" : isUrgent ? "text-amber-600" : "text-emerald-600"
                                )}>{d.remaining}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                              <BookOpen className="w-3 h-3" />
                              <span>{statute.legalBasis} — {statute.description}</span>
                            </div>

                            {statute.warnings.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {statute.warnings.map((w) => (
                                  <div key={w} className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                                    <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {w}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tıkla-aç detay butonu */}
                            <div className="flex items-center gap-1 mt-3 text-xs text-blue-600">
                              <HelpCircle className="w-3 h-3" />
                              <span>Bu ne demek? Tiklayin</span>
                              <ChevronDown className={cn("w-3 h-3 transition-transform", expandedCard === d.subcategory && "rotate-180")} />
                            </div>

                            {/* Sade açıklama paneli */}
                            <AnimatePresence>
                              {expandedCard === d.subcategory && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <HelpCircle className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Sade Turkce Aciklama</p>
                                        <p className="text-sm text-blue-800 leading-relaxed">{statute.plainExplanation}</p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <strong>Uyari:</strong> Zamanasimi sureleri genel bilgi nitelikindedir. Ozel durumlar, durma ve kesilme halleri sureleri etkileyebilir. Kesin hesaplama icin avukata danisiniz.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
