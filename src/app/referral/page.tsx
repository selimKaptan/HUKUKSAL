"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Gift, Copy, Check, Users, TrendingUp, Share2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getShareLink, getShareText, shareApp, recordShare, getBonusAnalyses } from "@/lib/referral";

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const [shareResult, setShareResult] = useState("");
  const link = getShareLink();
  const bonusCount = getBonusAnalyses();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${getShareText()}\n${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shared = await shareApp();
    if (shared) {
      const result = recordShare();
      setShareResult(result.bonusGranted ? "1 bonus analiz hakkı kazandınız!" : "Paylaşıldı!");
      setTimeout(() => setShareResult(""), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${getShareText()} ${link}`)}`, "_blank");
    recordShare();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Haklarım</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Link>

        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-200">
            <Gift className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Paylaş & Kazan</h1>
          <p className="text-lg text-slate-500">Her 3 paylaşımda <strong className="text-amber-600">+1 ücretsiz analiz</strong> kazanın!</p>
        </div>

        {/* İstatistik */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{bonusCount}</div>
              <p className="text-xs text-slate-500">Bonus Analiz Hakkı</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-amber-600">3</div>
              <p className="text-xs text-slate-500">Paylaşımda 1 Hak</p>
            </CardContent>
          </Card>
        </div>

        {/* Paylaş Linki */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Paylaşım Linkiniz</h2>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 truncate">
                {link}
              </div>
              <Button onClick={handleCopy} className="flex-shrink-0">
                {copied ? <><Check className="w-4 h-4 mr-1" /> Kopyalandı</> : <><Copy className="w-4 h-4 mr-1" /> Kopyala</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Paylaşım Butonları */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Button onClick={handleShareWhatsApp} size="lg" className="bg-emerald-500 hover:bg-emerald-600 gap-2">
            <MessageCircle className="w-5 h-5" /> WhatsApp
          </Button>
          <Button onClick={handleShare} variant="outline" size="lg" className="gap-2">
            <Share2 className="w-5 h-5" /> Paylaş
          </Button>
        </div>

        {shareResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-100 text-emerald-700 text-sm font-semibold py-3 px-4 rounded-xl text-center mb-6">
            {shareResult}
          </motion.div>
        )}

        {/* Nasıl Çalışır */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nasıl Çalışır?</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Linkinizi paylaşın", desc: "Arkadaşlarınıza Haklarım uygulamasını tanıtın." },
                { step: "2", title: "3 paylaşım yapın", desc: "WhatsApp, sosyal medya veya mesaj ile paylaşın." },
                { step: "3", title: "Analiz hakkı kazanın", desc: "Her 3 paylaşımda +1 ücretsiz analiz hakkı otomatik eklenir." },
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
