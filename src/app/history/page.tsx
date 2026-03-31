"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Trash2, Eye, Clock, TrendingUp, Calendar, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getCasesByUser, deleteCaseById, type SavedCase } from "@/lib/case-storage";
import { getCasesByUserId, deleteCaseDB, type DBCase } from "@/lib/db";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const filteredCases = cases.filter((c) => {
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.eventSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !filterCategory || c.category === filterCategory;
    return matchSearch && matchCategory;
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      // DB'den oku, yoksa localStorage'dan
      getCasesByUserId(user.id).then((dbCases) => {
        if (dbCases.length > 0) {
          const mapped: SavedCase[] = dbCases.map((c: DBCase) => ({
            id: c.id,
            userId: c.user_id,
            title: c.title,
            category: c.category as CaseCategory,
            eventSummary: c.event_summary,
            result: {
              winProbability: c.win_probability || 0,
              strengths: c.strengths || [],
              weaknesses: c.weaknesses || [],
              recommendation: (c.recommendation || "needs_review") as "file_case" | "do_not_file" | "needs_review",
              analysisReport: c.analysis_report || "",
              matchedPrecedents: [],
              riskFactors: c.risk_factors || [],
              suggestedActions: c.suggested_actions || [],
            },
            createdAt: c.created_at,
            aiProvider: (c.ai_provider || "local") as "claude" | "local",
          }));
          setCases(mapped);
        } else {
          setCases(getCasesByUser(user.id));
        }
      });
    }
  }, [user, authLoading, router]);

  const handleDelete = (caseId: string) => {
    if (confirm("Bu analizi silmek istediğinize emin misiniz?")) {
      deleteCaseById(caseId);
      deleteCaseDB(caseId).catch(() => {});
      if (user) {
        setCases((prev) => prev.filter((c) => c.id !== caseId));
      }
    }
  };

  const handleView = (savedCase: SavedCase) => {
    sessionStorage.setItem(
      "analysisResult",
      JSON.stringify({
        result: savedCase.result,
        caseTitle: savedCase.title,
        category: savedCase.category,
      })
    );
    router.push("/results");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

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
          <Link href="/dashboard">
            <Button size="sm">Yeni Analiz</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900">Dava Geçmişi</h1>
          <p className="text-slate-500 mt-1">{user?.name && `${user.name}, `}toplam {cases.length} analiz</p>
        </div>

        {/* Arama ve Filtreleme */}
        {cases.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Dava başlığı veya olay özeti ara..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-10 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-400 appearance-none"
              >
                <option value="">Tüm Kategoriler</option>
                {Object.entries(CASE_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            {(searchQuery || filterCategory) && (
              <p className="text-xs text-slate-500 self-center">{filteredCases.length} sonuç</p>
            )}
          </div>
        )}

        {cases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz analiz yok</h3>
            <p className="text-slate-500 mb-6">İlk dava analizinizi başlatın</p>
            <Link href="/dashboard">
              <Button>Analiz Başlat</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900 truncate">{c.title}</h3>
                          <Badge variant={
                            c.result.winProbability >= 65 ? "success" :
                            c.result.winProbability >= 40 ? "warning" : "danger"
                          }>
                            %{c.result.winProbability}
                          </Badge>
                          <Badge variant="outline">
                            {CASE_CATEGORY_LABELS[c.category]}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                          {c.eventSummary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(c.createdAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {c.aiProvider === "claude" ? "Claude AI" : "Yerel AI"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleView(c)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Görüntüle
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
