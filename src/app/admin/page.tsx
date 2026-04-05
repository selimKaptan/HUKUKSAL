"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Scale, Users, FileText, TrendingUp, Shield, Trash2,
  BarChart3, Activity, Sparkles, Cpu, Clock,
  UserCheck, UserX, ChevronDown, ChevronUp, RefreshCw,
  ShieldCheck, ShieldAlert, CheckCircle2, XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminStats,
  deleteUser,
  type AdminStats,
} from "@/lib/admin-service";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import {
  getPendingVerifications,
  updateVerificationStatus,
} from "@/lib/lawyer-verification";

type TabType = "overview" | "users" | "cases" | "verification";

async function verifyAdminServerSide(email: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return data.isAdmin === true;
  } catch {
    return false;
  }
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [pendingLawyers, setPendingLawyers] = useState<{ id: string; name: string; email: string; baroSicilNo: string; barAssociation: string; city: string }[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const [serverVerified, setServerVerified] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/");
      return;
    }
    if (user && isAdmin) {
      // Server-side admin doğrulama
      verifyAdminServerSide(user.email).then((verified) => {
        if (!verified) {
          router.push("/");
          return;
        }
        setServerVerified(true);
        setStats(getAdminStats());
        loadPendingVerifications();
      });
    }
  }, [user, loading, isAdmin, router]);

  const loadPendingVerifications = async () => {
    const pending = await getPendingVerifications();
    setPendingLawyers(pending);
  };

  const refreshStats = () => {
    setStats(getAdminStats());
    loadPendingVerifications();
  };

  const handleVerifyLawyer = async (lawyerId: string, status: "verified" | "rejected") => {
    setVerifyingId(lawyerId);
    const note = status === "rejected" ? prompt("Red sebebi (opsiyonel):") || undefined : undefined;
    await updateVerificationStatus(lawyerId, status, note);
    setPendingLawyers((prev) => prev.filter((l) => l.id !== lawyerId));
    setVerifyingId(null);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`"${userName}" kullanıcısını ve tüm verilerini silmek istediğinize emin misiniz?`)) {
      deleteUser(userId);
      refreshStats();
    }
  };

  if (loading || !stats || !serverVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Doğrulanıyor...</div>
      </div>
    );
  }

  if (!isAdmin || !serverVerified) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Admin Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Haklarım
              <span className="text-xs text-red-400 ml-2 font-normal">ADMIN</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="danger" className="gap-1">
              <Shield className="w-3 h-3" />
              {user?.email}
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshStats} className="text-white border-white/20 hover:bg-white/10">
              <RefreshCw className="w-4 h-4 mr-1" />
              Yenile
            </Button>
            <Link href="/">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Scale className="w-4 h-4 mr-1" />
                Ana sayfa
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Admin Paneli</h1>
          <p className="text-slate-400">
            Hoş geldiniz, {user?.name || user?.email}. Sistemdeki tüm verilere erişiminiz var.
          </p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={<Users className="w-5 h-5" />} label="Toplam Kullanıcı" value={stats.totalUsers} color="blue" />
          <StatCard icon={<FileText className="w-5 h-5" />} label="Toplam Analiz" value={stats.totalCases} color="green" />
          <StatCard icon={<Activity className="w-5 h-5" />} label="Bugünkü Analiz" value={stats.totalCasesToday} color="purple" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Ort. Kazanma %" value={`%${stats.avgWinProbability}`} color="orange" />
        </motion.div>

        {/* Secondary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={<UserCheck className="w-5 h-5" />} label="Avukat" value={stats.totalLawyers} color="teal" />
          <StatCard icon={<UserX className="w-5 h-5" />} label="Müvekkil" value={stats.totalClients} color="slate" />
          <StatCard icon={<Sparkles className="w-5 h-5" />} label="Claude AI" value={stats.claudeAnalysisCount} color="violet" />
          <StatCard icon={<Cpu className="w-5 h-5" />} label="Yerel AI" value={stats.localAnalysisCount} color="amber" />
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Kategori Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                  <div key={cat} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">{CASE_CATEGORY_LABELS[cat as CaseCategory] || cat}</p>
                    <p className="text-xl font-black text-white">{count}</p>
                  </div>
                ))}
                {Object.keys(stats.categoryDistribution).length === 0 && (
                  <p className="text-slate-500 col-span-5 text-center py-4">Henüz analiz yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "overview" as TabType, label: "Genel Bakış", icon: <BarChart3 className="w-4 h-4" /> },
            { id: "users" as TabType, label: `Kullanıcılar (${stats.totalUsers})`, icon: <Users className="w-4 h-4" /> },
            { id: "cases" as TabType, label: `Analizler (${stats.totalCases})`, icon: <FileText className="w-4 h-4" /> },
            { id: "verification" as TabType, label: `Doğrulama (${pendingLawyers.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab !== tab.id ? "text-slate-300 border-white/20 hover:bg-white/10" : ""}
            >
              {tab.icon}
              <span className="ml-1">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Son Kayıt Olan Kullanıcılar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.recentUsers.slice(0, 8).map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.role === "lawyer" ? "success" : "outline"} className="text-xs">
                        {u.role === "lawyer" ? "Avukat" : u.role === "admin" ? "Admin" : "Müvekkil"}
                      </Badge>
                      <span className="text-xs text-slate-500">{u.caseCount} analiz</span>
                    </div>
                  </div>
                ))}
                {stats.recentUsers.length === 0 && (
                  <p className="text-slate-500 text-center py-4">Henüz kullanıcı yok</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Cases */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  Son Analizler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.recentCases.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{c.title}</p>
                      <p className="text-xs text-slate-400">{c.userName} - {c.userEmail}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={c.winProbability >= 65 ? "success" : c.winProbability >= 40 ? "warning" : "danger"}>
                        %{c.winProbability}
                      </Badge>
                      <Badge variant={c.aiProvider === "claude" ? "default" : "outline"} className="text-xs">
                        {c.aiProvider === "claude" ? "AI" : "Yerel"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {stats.recentCases.length === 0 && (
                  <p className="text-slate-500 text-center py-4">Henüz analiz yok</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Kullanıcı</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">E-posta</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Rol</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Analiz</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Kayıt Tarihi</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{(u.name || "?")[0].toUpperCase()}</span>
                              </div>
                              <span className="text-sm font-medium text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-300">{u.email}</td>
                          <td className="py-3 px-4">
                            <Badge variant={u.role === "lawyer" ? "success" : u.role === "admin" ? "danger" : "outline"}>
                              {u.role === "lawyer" ? "Avukat" : u.role === "admin" ? "Admin" : "Müvekkil"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-white font-semibold">{u.caseCount}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString("tr-TR") : "-"}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stats.recentUsers.length === 0 && (
                    <p className="text-slate-500 text-center py-8">Henüz kayıtlı kullanıcı yok</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "verification" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Avukat Doğrulama Başvuruları
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLawyers.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                    <p className="text-slate-500">Bekleyen doğrulama başvurusu yok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingLawyers.map((lawyer) => (
                      <div key={lawyer.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                              <ShieldAlert className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">{lawyer.name}</h3>
                              <p className="text-xs text-slate-400">{lawyer.email}</p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <Badge variant="outline" className="text-xs text-slate-300 gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Sicil: {lawyer.baroSicilNo}
                                </Badge>
                                <Badge variant="outline" className="text-xs text-slate-300">
                                  {lawyer.barAssociation}
                                </Badge>
                                <Badge variant="outline" className="text-xs text-slate-300">
                                  {lawyer.city}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                              disabled={verifyingId === lawyer.id}
                              onClick={() => handleVerifyLawyer(lawyer.id, "verified")}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-400 border-red-400/30 hover:bg-red-500/10 gap-1"
                              disabled={verifyingId === lawyer.id}
                              onClick={() => handleVerifyLawyer(lawyer.id, "rejected")}
                            >
                              <XCircle className="w-4 h-4" /> Reddet
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "cases" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {stats.recentCases.map((c) => (
              <Card key={c.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
                <CardContent className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <Badge variant={c.winProbability >= 65 ? "success" : c.winProbability >= 40 ? "warning" : "danger"} className="text-lg font-black px-3 py-1">
                          %{c.winProbability}
                        </Badge>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{c.title}</p>
                        <p className="text-xs text-slate-400">
                          {c.userName} ({c.userEmail}) - {new Date(c.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs text-slate-300">
                        {CASE_CATEGORY_LABELS[c.category] || c.category}
                      </Badge>
                      <Badge variant={c.aiProvider === "claude" ? "default" : "outline"} className="text-xs">
                        {c.aiProvider === "claude" ? <><Sparkles className="w-3 h-3 mr-1" />Claude</> : <><Cpu className="w-3 h-3 mr-1" />Yerel</>}
                      </Badge>
                      <Badge variant={c.recommendation === "file_case" ? "success" : c.recommendation === "needs_review" ? "warning" : "danger"} className="text-xs">
                        {c.recommendation === "file_case" ? "Dava Aç" : c.recommendation === "needs_review" ? "İncele" : "Açma"}
                      </Badge>
                      {expandedCase === c.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                  {expandedCase === c.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Kullanıcı ID:</span>
                          <span className="text-white ml-2 font-mono text-xs">{c.userId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Dava ID:</span>
                          <span className="text-white ml-2 font-mono text-xs">{c.id}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            ))}
            {stats.recentCases.length === 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">Henüz analiz yok</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    teal: "from-teal-500 to-teal-600",
    slate: "from-slate-500 to-slate-600",
    violet: "from-violet-500 to-violet-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} flex items-center justify-center shadow-lg`}>
          <span className="text-white">{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
