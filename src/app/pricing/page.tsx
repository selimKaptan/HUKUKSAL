"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Check, Sparkles, Crown, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { PLANS, type PaymentPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: PaymentPlan) => {
    if (plan.priceValue === 0) {
      window.location.href = "/dashboard";
      return;
    }

    if (!user) {
      window.location.href = "/auth/register";
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, user }),
      });

      const data = await res.json();

      if (data.checkoutFormContent) {
        // iyzico checkout form'u yeni pencerede aç
        const win = window.open("", "_blank", "width=600,height=700");
        if (win) {
          win.document.write(`
            <html><head><title>JusticeGuard Ödeme</title></head>
            <body style="display:flex;justify-content:center;padding:20px;font-family:sans-serif;">
              <div>${data.checkoutFormContent}</div>
            </body></html>
          `);
        }
      } else if (data.paymentPageUrl) {
        window.open(data.paymentPageUrl, "_blank");
      } else {
        alert(data.error || "Ödeme başlatılamadı. iyzico API anahtarlarını kontrol edin.");
      }
    } catch {
      alert("Ödeme sistemi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const displayPlans = PLANS.filter((p) => p.id !== "pro_yearly"); // Ana 3 planı göster

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8">
          <ArrowLeft className="w-4 h-4" /> Ana Sayfa
        </Link>

        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-slate-900 mb-4"
          >
            Planınızı Seçin
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            3 ücretsiz analizle başlayın, ihtiyacınıza göre yükseltin
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {displayPlans.map((plan, index) => {
            const isPro = plan.id.includes("pro");
            const isLawyer = plan.id.includes("lawyer");
            const Icon = isLawyer ? Briefcase : isPro ? Crown : Sparkles;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "relative overflow-hidden transition-all hover:shadow-xl",
                  plan.popular ? "border-2 border-blue-500 shadow-lg shadow-blue-100" : "border-slate-200"
                )}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center text-xs font-bold py-1.5">
                      EN POPÜLER
                    </div>
                  )}
                  <CardContent className={cn("p-8", plan.popular && "pt-12")}>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
                      isLawyer ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200" :
                      isPro ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-200" :
                      "bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-200"
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black text-slate-900">{plan.price.split("/")[0]}</span>
                      {plan.price.includes("/") && (
                        <span className="text-sm text-slate-500">/{plan.price.split("/")[1]}</span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <Check className={cn(
                            "w-4 h-4 mt-0.5 flex-shrink-0",
                            isPro ? "text-blue-500" : isLawyer ? "text-emerald-500" : "text-slate-400"
                          )} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingPlan === plan.id}
                      size="lg"
                      className={cn("w-full",
                        plan.priceValue === 0 && "bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-none",
                        isLawyer && "bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/40"
                      )}
                      variant={plan.priceValue === 0 ? "secondary" : "default"}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {plan.priceValue === 0 ? "Ücretsiz Başla" : "Satın Al"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Yıllık plan notu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <p className="text-sm text-blue-800">
            <strong>Yıllık ödeme ile %33 tasarruf edin!</strong> Pro Yıllık: 799 ₺/yıl (ayda sadece 66 ₺)
          </p>
        </motion.div>

        {/* Güvenlik notu */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Ödemeler iyzico güvencesiyle gerçekleştirilir. 256-bit SSL şifreleme. İstediğiniz zaman iptal edebilirsiniz.
        </div>
      </div>
    </div>
  );
}
