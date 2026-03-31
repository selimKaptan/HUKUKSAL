"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Gift, Copy, Check, Users, TrendingUp, Share2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { getReferralLink, getReferralCode, getReferralStats } from "@/lib/referral";
import { useRouter } from "next/navigation";

export default function ReferralPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");
  const [code, setCode] = useState("");
  const [stats, setStats] = useState({ totalInvites: 0, completedInvites: 0, earnedAnalyses: 0 });

  useEffect(() => {
    if (!loading && !user) { router.push("/auth/login"); return; }
    if (user) {
      setLink(getReferralLink(user.id));
      setCode(getReferralCode(user.id));
      setStats(getReferralStats(user.id));
    }
  }, [user, loading, router]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`JusticeGuard'da davanızın kazanma ihtimalini ücretsiz öğrenin! ${link}`)}`, "_blank");
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-400">Yükleniyor...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Justice<span className="text-blue-600">Guard</span></span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-200">
            <Gift className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Arkadaşını Davet Et</h1>
          <p className="text-lg text-slate-500">Her başarılı davet için <strong className="text-amber-600">+1 ücretsiz analiz</strong> kazanın!</p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{stats.totalInvites}</div>
              <p className="text-xs text-slate-500">Davet Edilen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Check className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-emerald-600">{stats.completedInvites}</div>
              <p className="text-xs text-slate-500">Kayıt Olan</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-amber-600">+{stats.earnedAnalyses}</div>
              <p className="text-xs text-slate-500">Kazanılan Analiz</p>
            </CardContent>
          </Card>
        </div>

        {/* Referans Linki */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Davet Linkiniz</h2>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 truncate">
                {link}
              </div>
              <Button onClick={handleCopy} className="flex-shrink-0">
                {copied ? <><Check className="w-4 h-4 mr-1" /> Kopyalandı</> : <><Copy className="w-4 h-4 mr-1" /> Kopyala</>}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-slate-400">Kodunuz:</span>
              <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{code}</span>
            </div>
          </CardContent>
        </Card>

        {/* Paylaşım Butonları */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Button onClick={handleShareWhatsApp} size="lg" className="bg-emerald-500 hover:bg-emerald-600 gap-2">
            <MessageCircle className="w-5 h-5" /> WhatsApp ile Paylaş
          </Button>
          <Button onClick={handleCopy} variant="outline" size="lg" className="gap-2">
            <Share2 className="w-5 h-5" /> Linki Kopyala
          </Button>
        </div>

        {/* Nasıl Çalışır */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nasıl Çalışır?</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Linkinizi paylaşın", desc: "Yukarıdaki davet linkini arkadaşlarınızla paylaşın." },
                { step: "2", title: "Arkadaşınız kayıt olsun", desc: "Linke tıklayan kişi JusticeGuard'a kayıt olsun." },
                { step: "3", title: "Analiz hakkı kazanın", desc: "Her başarılı kayıt için +1 ücretsiz analiz hakkı otomatik eklenir." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
