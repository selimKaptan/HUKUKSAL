"use client";

import { motion } from "framer-motion";
import { Scale, User, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterSelectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Hesap Oluştur</h1>
          <p className="text-slate-500">Nasıl kayıt olmak istiyorsunuz?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Müvekkil Kartı */}
          <Link href="/auth/register/client">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8 cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Müvekkil</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Davanızı analiz ettirin, emsal kararları inceleyin ve size uygun avukat bulun.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Müvekkil Olarak Kayıt Ol <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          </Link>

          {/* Avukat Kartı */}
          <Link href="/auth/register/lawyer">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8 cursor-pointer hover:border-emerald-500 hover:shadow-xl transition-all group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Avukat</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Profilinizi oluşturun, uzmanlık alanlarınızı belirtin ve müvekkil bulun.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Avukat Olarak Kayıt Ol <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          </Link>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Zaten hesabınız var mı?{" "}
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Giriş Yap
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
