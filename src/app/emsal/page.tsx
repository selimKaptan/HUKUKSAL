"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale, ArrowLeft, Search, Crown, FileText,
  TrendingUp, TrendingDown, Minus, Calendar, Building2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getUserPlan } from "@/lib/feature-gate";
import { ProWall } from "@/components/paywall";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { PRECEDENTS_DB } from "@/lib/precedents-data";

export default function EmsalPage() {
  const { user } = useAuth();
  const plan = getUserPlan(user);
  const [showProWall, setShowProWall] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pro kontrolü
  if (plan !== "pro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">AI Emsal Karar Arama</h2>
            <p className="text-sm text-slate-500 mb-6">
              Yargıtay, Danıştay, AYM ve AİHM kararlarını arayın.
              Kazanma oranı ve benzer dava analizi alın.
            </p>
            <Button onClick={() => setShowProWall(true)} className="bg-gradient-to-r from-teal-600 to-emerald-600">
              <Crown className="w-4 h-4 mr-2" /> Pro ile Aç
            </Button>
            <Link href="/" className="block mt-4 text-sm text-slate-400 hover:text-slate-600">Geri dön</Link>
            <ProWall show={showProWall} onClose={() => setShowProWall(false)} feature="Emsal karar arama" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Emsal arama
  const filtered = PRECEDENTS_DB.filter((p) => {
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    const matchSearch = !searchTerm ||
      p.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ruling.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.case_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Haklarım</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
          <Search className="w-6 h-6 text-teal-600" /> AI Emsal Karar Arama
        </h1>
        <p className="text-sm text-slate-500 mb-6">Yargıtay, Danıştay ve mahkeme kararlarını arayın</p>

        {/* Arama */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Emsal karar ara (kıdem tazminatı, tahliye, nafaka...)"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 outline-none"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CaseCategory)}
                className="h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-900 focus:border-teal-500 outline-none"
              >
                <option value="">Tüm Kategoriler</option>
                {Object.entries(CASE_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sonuçlar */}
        <p className="text-sm text-slate-500 mb-4">{filtered.length} emsal karar bulundu</p>

        <div className="space-y-3">
          {filtered.map((precedent, idx) => {
            const pId = `p_${idx}`;
            const expanded = expandedId === pId;
            const outcomeConfig = {
              plaintiff_won: { label: "Davacı Kazandı", color: "text-emerald-600 bg-emerald-50", icon: TrendingUp },
              defendant_won: { label: "Davalı Kazandı", color: "text-red-600 bg-red-50", icon: TrendingDown },
              settled: { label: "Uzlaşma", color: "text-blue-600 bg-blue-50", icon: Minus },
              dismissed: { label: "Reddedildi", color: "text-slate-600 bg-slate-100", icon: Minus },
            };
            const outcome = outcomeConfig[precedent.outcome];
            const OutcomeIcon = outcome.icon;

            return (
              <motion.div key={pId} layout>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedId(expanded ? null : pId)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">{CASE_CATEGORY_LABELS[precedent.category as CaseCategory] || precedent.category}</Badge>
                          <Badge className={`text-xs gap-1 ${outcome.color}`}>
                            <OutcomeIcon className="w-3 h-3" /> {outcome.label}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mb-1">{precedent.summary}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {precedent.court}</span>
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {precedent.case_number}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {precedent.date}</span>
                        </div>
                      </div>
                    </div>

                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-slate-100"
                      >
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Karar:</h4>
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{precedent.ruling}</p>

                        {precedent.duration_days && (
                          <p className="text-xs text-slate-400">
                            Dava süresi: {Math.round(precedent.duration_days / 30)} ay ({precedent.duration_days} gün)
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {precedent.keywords.map((kw) => (
                            <span key={kw} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{kw}</span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Arama kriterlerinize uygun emsal karar bulunamadı.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
