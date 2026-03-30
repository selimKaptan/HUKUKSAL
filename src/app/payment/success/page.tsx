"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { activatePlan } from "@/lib/subscription";

function SuccessContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId") || "pro_monthly";

  useEffect(() => {
    if (user) {
      activatePlan(user.id, planId);
    }
  }, [user, planId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>

        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900">
            Justice<span className="text-blue-600">Guard</span>
          </span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4">
          Odeme Basarili!
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Pro planınız aktif edildi. Artık sınırsız analiz yapabilirsiniz.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="w-full group">
              Analiz Yapmaya Basla
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              Ana Sayfaya Don
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-400">Yükleniyor...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
