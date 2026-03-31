"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, Shield, Users, BarChart3, Settings, Database, ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { isAdmin } from "@/lib/subscription";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [lawyerCount, setLawyerCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push("/dashboard");
      return;
    }

    // localStorage'dan kullanıcı sayılarını al
    try {
      const users = JSON.parse(localStorage.getItem("jg_users") || "[]");
      setUserCount(users.length);
      const lawyers = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
      setLawyerCount(lawyers.length);
    } catch { /* ignore */ }
  }, [user, loading, router]);

  if (loading || !user || !isAdmin(user.email)) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-400">Yükleniyor...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900">Admin Panel</span>
            </Link>
            <Badge variant="danger">Admin</Badge>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-slate-900 mb-1">Hoşgeldin, {user.name}</h1>
        <p className="text-slate-500 mb-8">{user.email} - Sınırsız erişim</p>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Toplam Kullanıcı", value: userCount, color: "text-blue-600 bg-blue-50" },
            { icon: Scale, label: "Kayıtlı Avukat", value: lawyerCount, color: "text-emerald-600 bg-emerald-50" },
            { icon: BarChart3, label: "Plan", value: "Admin", color: "text-violet-600 bg-violet-50" },
            { icon: Activity, label: "Analiz Limiti", value: "Sınırsız", color: "text-amber-600 bg-amber-50" },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-5 text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Hızlı Erişim */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">Hızlı Erişim</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <Scale className="w-8 h-8 text-blue-500" />
                <div>
                  <h3 className="font-bold text-slate-900">Dava Analizi</h3>
                  <p className="text-xs text-slate-500">Sınırsız analiz yap</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/ask">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <Database className="w-8 h-8 text-violet-500" />
                <div>
                  <h3 className="font-bold text-slate-900">AI Danışmanı</h3>
                  <p className="text-xs text-slate-500">Hukuki soru sor</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/history">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <Settings className="w-8 h-8 text-slate-500" />
                <div>
                  <h3 className="font-bold text-slate-900">Analiz Geçmişi</h3>
                  <p className="text-xs text-slate-500">Tüm analizleri gör</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <strong>Admin Bilgi:</strong> Bu hesap ({user.email}) sınırsız analiz hakkına sahiptir. Limit kontrolü uygulanmaz.
        </div>
      </div>
    </div>
  );
}
