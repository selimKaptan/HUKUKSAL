"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Trash2, Eye, Clock, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getCasesByUser, deleteCaseById, type SavedCase } from "@/lib/case-storage";
import { CASE_CATEGORY_LABELS } from "@/types/database";

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<SavedCase[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      setCases(getCasesByUser(user.id));
    }
  }, [user, authLoading, router]);

  const handleDelete = (caseId: string) => {
    if (confirm("Bu analizi silmek istediğinize emin misiniz?")) {
      deleteCaseById(caseId);
      if (user) setCases(getCasesByUser(user.id));
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Dava Geçmişi</h1>
            <p className="text-slate-500 mt-1">
              {user?.name && `${user.name}, `}toplam {cases.length} analiz
            </p>
          </div>
        </div>

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
            {cases.map((c, index) => (
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
