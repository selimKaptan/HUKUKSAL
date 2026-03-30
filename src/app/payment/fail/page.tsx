"use client";

import { motion } from "framer-motion";
import { Scale, XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-200">
          <XCircle className="w-12 h-12 text-white" />
        </div>

        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900">
            Justice<span className="text-blue-600">Guard</span>
          </span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4">
          Odeme Basarisiz
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Odeme islemi tamamlanamadi. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/pricing">
            <Button size="lg" className="w-full">
              <RefreshCw className="w-5 h-5 mr-2" />
              Tekrar Dene
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ana Sayfaya Don
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
