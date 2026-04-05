"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale, Check, X, Crown, ArrowLeft, Sparkles, Shield,
  FileText, MessageCircle, Search, Calculator, Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLANS, FEATURE_MATRIX } from "@/lib/feature-gate";

export default function PricingPage() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const proPrice = period === "yearly"
    ? { price: PLANS.pro.priceYearly, perMonth: Math.round(PLANS.pro.priceYearly / 12), save: PLANS.pro.priceMonthly * 12 - PLANS.pro.priceYearly }
    : { price: PLANS.pro.priceMonthly, perMonth: PLANS.pro.priceMonthly, save: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Haklarım</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Ana sayfa
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-3">Planınızı Seçin</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Ücretsiz başlayın, ihtiyacınız olduğunda Pro&apos;ya geçin.
            <br />App Store ve Google Play üzerinden satın alabilirsiniz.
          </p>

          {/* Period Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${period === "monthly" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200"}`}
            >
              Aylık
            </button>
            <button
              onClick={() => setPeriod("yearly")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${period === "yearly" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200"}`}
            >
              Yıllık
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                %{Math.round((1 - PLANS.pro.priceYearly / (PLANS.pro.priceMonthly * 12)) * 100)} indirim
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {/* Free Plan */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full border-2 border-slate-200 hover:border-slate-300 transition-colors">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Ücretsiz</h3>
                <p className="text-sm text-slate-500 mb-6">Hemen kullanmaya başlayın</p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black text-slate-900">0</span>
                  <span className="text-lg text-slate-500">TL</span>
                </div>

                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full mb-8">
                    Ücretsiz Başla
                  </Button>
                </Link>

                <div className="space-y-3">
                  <FeatureRow icon={<Search className="w-4 h-4" />} text="Aylık 3 dava analizi" included />
                  <FeatureRow icon={<MessageCircle className="w-4 h-4" />} text="Mesajlaşma" included />
                  <FeatureRow icon={<Calculator className="w-4 h-4" />} text="Tüm hukuk araçları" included />
                  <FeatureRow icon={<Search className="w-4 h-4" />} text="Avukat arama" included />
                  <FeatureRow icon={<Shield className="w-4 h-4" />} text="Emsal karar arama" included />
                  <div className="border-t border-slate-100 pt-3 mt-3" />
                  <FeatureRow icon={<FileText className="w-4 h-4" />} text="PDF rapor indirme" />
                  <FeatureRow icon={<Sparkles className="w-4 h-4" />} text="AI hukuk asistanı" />
                  <FeatureRow icon={<FileText className="w-4 h-4" />} text="Belge analizi (OCR)" />
                  <FeatureRow icon={<Zap className="w-4 h-4" />} text="Sınırsız analiz" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full border-2 border-indigo-500 shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="absolute top-4 right-4">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  En Popüler
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-indigo-600" /> Pro
                </h3>
                <p className="text-sm text-slate-500 mb-6">Tüm özellikler, sınırsız</p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-slate-900">{proPrice.perMonth}</span>
                  <span className="text-lg text-slate-500">TL/ay</span>
                </div>
                {period === "yearly" && (
                  <p className="text-sm text-emerald-600 font-semibold mb-6">
                    Yıllık {proPrice.price} TL — {proPrice.save} TL tasarruf
                  </p>
                )}
                {period === "monthly" && <div className="mb-6" />}

                <Button size="lg" className="w-full mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-200">
                  <Crown className="w-4 h-4 mr-2" />
                  App Store&apos;dan Satın Al
                </Button>

                <div className="space-y-3">
                  <FeatureRow icon={<Zap className="w-4 h-4" />} text="Sınırsız dava analizi" included pro />
                  <FeatureRow icon={<MessageCircle className="w-4 h-4" />} text="Sınırsız mesajlaşma" included pro />
                  <FeatureRow icon={<Calculator className="w-4 h-4" />} text="Tüm hukuk araçları" included />
                  <FeatureRow icon={<Search className="w-4 h-4" />} text="Avukat arama" included />
                  <FeatureRow icon={<Shield className="w-4 h-4" />} text="Emsal karar arama" included />
                  <div className="border-t border-indigo-100 pt-3 mt-3" />
                  <FeatureRow icon={<FileText className="w-4 h-4" />} text="PDF rapor indirme" included pro />
                  <FeatureRow icon={<Sparkles className="w-4 h-4" />} text="AI hukuk asistanı" included pro />
                  <FeatureRow icon={<FileText className="w-4 h-4" />} text="Belge analizi (OCR)" included pro />
                  <FeatureRow icon={<Crown className="w-4 h-4" />} text="Öncelikli destek" included pro />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Karşılaştırma Tablosu */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Detaylı Karşılaştırma</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Özellik</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Ücretsiz</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-t-lg">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_MATRIX.map((feature, i) => (
                      <tr key={feature.id} className={i % 2 === 0 ? "bg-slate-50/50" : ""}>
                        <td className="py-3 px-4 text-sm text-slate-700">{feature.name}</td>
                        <td className="py-3 px-4 text-center">
                          <CellValue value={feature.free} />
                        </td>
                        <td className="py-3 px-4 text-center bg-indigo-50/30">
                          <CellValue value={feature.pro} pro />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Sık Sorulan Sorular</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <FaqItem q="Ücretsiz plan gerçekten ücretsiz mi?" a="Evet! Aylık 3 analiz, mesajlaşma ve tüm araçlar tamamen ücretsiz. Kredi kartı gerekmez." />
            <FaqItem q="Pro'yu nasıl satın alabilirim?" a="App Store veya Google Play üzerinden uygulama içi satın alma ile Pro'ya geçebilirsiniz." />
            <FaqItem q="İstediğim zaman iptal edebilir miyim?" a="Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. Kalan süreniz boyunca Pro özellikler aktif kalır." />
            <FaqItem q="Verilerim güvende mi?" a="Tüm verileriniz şifreli olarak saklanır. KVKK uyumlu çalışıyoruz. Detaylar için Gizlilik Politikamızı inceleyin." />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureRow({ text, included = false, pro = false }: { icon?: React.ReactNode; text: string; included?: boolean; pro?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {included ? (
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${pro ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
          <Check className="w-3 h-3" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <X className="w-3 h-3" />
        </div>
      )}
      <span className={`text-sm ${included ? "text-slate-700" : "text-slate-400"}`}>{text}</span>
    </div>
  );
}

function CellValue({ value, pro = false }: { value: boolean | number | string; pro?: boolean }) {
  if (value === true) return <Check className={`w-5 h-5 mx-auto ${pro ? "text-indigo-600" : "text-emerald-600"}`} />;
  if (value === false) return <X className="w-5 h-5 mx-auto text-slate-300" />;
  return <span className={`text-sm font-semibold ${pro ? "text-indigo-600" : "text-slate-700"}`}>{String(value)}</span>;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h4 className="text-sm font-bold text-slate-900 mb-2">{q}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
    </div>
  );
}
