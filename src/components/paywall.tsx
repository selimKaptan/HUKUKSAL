"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Crown, LogIn, X, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PLANS, FEATURE_MATRIX } from "@/lib/feature-gate";

/**
 * Login Wall - Giriş yapılması gereken özellikler için
 */
export function LoginWall({
  show,
  onClose,
  feature = "bu özelliği",
}: {
  show: boolean;
  onClose: () => void;
  feature?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Ücretsiz Üye Olun
            </h3>
            <p className="text-slate-500 mb-6">
              {feature} kullanmak için ücretsiz hesap oluşturun. Sadece 30 saniye!
            </p>

            <div className="space-y-2 text-left mb-6">
              {["Aylık 3 ücretsiz analiz", "Avukata mesaj gönderme", "Analiz geçmişi", "Tüm hukuk araçları"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Link href="/auth/register" className="block">
                <Button size="lg" className="w-full group">
                  Ücretsiz Üye Ol
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Zaten üyeyim, Giriş Yap
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Pro Wall - Pro üyelik gerektiren özellikler için
 */
export function ProWall({
  show,
  onClose,
  feature = "bu özelliği",
}: {
  show: boolean;
  onClose: () => void;
  feature?: string;
}) {
  const proFeatures = FEATURE_MATRIX.filter((f) => f.free === false && f.pro === true);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient background */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
              <Crown className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Pro&apos;ya Yükseltin
            </h3>
            <p className="text-slate-500 mb-2">
              {feature} <strong>Pro</strong> üyelik ile kullanılabilir.
            </p>

            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-4xl font-black text-slate-900">{PLANS.pro.priceMonthly}</span>
              <span className="text-lg text-slate-500">TL/ay</span>
            </div>

            <div className="space-y-2 text-left mb-6">
              {proFeatures.slice(0, 6).map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-sm text-slate-600">
                  <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {f.name}
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                Sınırsız dava analizi
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/pricing" className="block">
                <Button size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-300 hover:shadow-lg group">
                  <Crown className="w-4 h-4 mr-2" />
                  Pro&apos;ya Geç
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
                Şimdilik ücretsiz devam et
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Limit Wall - Kullanım limiti dolduğunda
 */
export function LimitWall({
  show,
  onClose,
  limitType = "analiz",
  resetInfo = "ay başında",
}: {
  show: boolean;
  onClose: () => void;
  limitType?: string;
  resetInfo?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {limitType.charAt(0).toUpperCase() + limitType.slice(1)} Limitiniz Doldu
            </h3>
            <p className="text-slate-500 mb-6">
              Ücretsiz {limitType} hakkınız tükendi. Limitiniz {resetInfo} sıfırlanacak
              veya Pro&apos;ya geçerek sınırsız kullanabilirsiniz.
            </p>

            <div className="space-y-3">
              <Link href="/pricing" className="block">
                <Button size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Crown className="w-4 h-4 mr-2" />
                  Pro ile Sınırsız Kullan
                </Button>
              </Link>
              <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
                {resetInfo} bekleyeceğim
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Pro Badge - Pro özellik olduğunu gösteren etiket
 */
export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${className}`}>
      <Crown className="w-3 h-3" />
      PRO
    </span>
  );
}

/**
 * Inline Pro Lock - Kilitli özellik göstergesi
 */
export function ProLock({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="relative group cursor-pointer">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          <Crown className="w-3.5 h-3.5" />
          Pro ile Aç
        </div>
      </div>
    </button>
  );
}
