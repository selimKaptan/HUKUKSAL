"use client";

import { motion } from "framer-motion";
import { Scale, Shield, FileSearch, ArrowRight, Sparkles, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// Store URL'leri - Yayına alındığında gerçek linklerle değiştirilecek
const APP_STORE_URL = "https://apps.apple.com/tr/app/justiceguard";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.justiceguard.app";

function StoreButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 justify-center items-center ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-black hover:bg-gray-800 text-white rounded-xl px-5 py-3 transition-all hover:scale-[1.02] shadow-lg"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <div className="text-left">
          <div className="text-[10px] leading-none opacity-80">Download on the</div>
          <div className="text-base font-semibold leading-tight">App Store</div>
        </div>
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-black hover:bg-gray-800 text-white rounded-xl px-5 py-3 transition-all hover:scale-[1.02] shadow-lg"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
          <path d="M3.18 23.67c-.28-.56-.18-4.58-.18-11.67S2.9.89 3.18.33C3.37 0 3.63 0 3.85.09l10.37 5.93c.22.12.22.36 0 .48L8.43 10.04l5.79 3.54c.22.12.22.36 0 .48L3.85 19.99l-.03.02 10.4 3.5c.22.08.22.32 0 .4L3.85 23.91c-.22.08-.48.08-.67-.24z" />
          <path d="M8.43 10.04l5.79-3.54 5.56-3.18c.44-.25.8-.04.8.48v16.4c0 .52-.36.73-.8.48L14.22 17.5l-5.79-3.54v-3.92z" opacity=".3" />
          <path d="M14.22 6.5l5.56-3.18c.44-.25.8-.04.8.48v16.4c0 .52-.36.73-.8.48l-5.56-3.18L8.43 13.96V10.04l5.79-3.54z" />
        </svg>
        <div className="text-left">
          <div className="text-[10px] leading-none opacity-80">GET IT ON</div>
          <div className="text-base font-semibold leading-tight">Google Play</div>
        </div>
      </a>
    </div>
  );
}

export { StoreButtons, APP_STORE_URL, PLAY_STORE_URL };

export function HeroSection() {
  const { user } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-5 py-2 text-sm font-medium text-blue-700 shadow-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Yapay Zeka Destekli Hukuki Analiz
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight"
        >
          Haklı mısın?
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Davanı Yapay Zekaya Sor.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Avukata gitmeden önce davanızın kazanma ihtimalini öğrenin.
          <br className="hidden md:block" />
          Emsal kararlarla karşılaştırın, bilinçli karar verin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {user ? (
            <Link href="/dashboard">
              <Button size="xl" className="group text-lg px-10">
                Analiz Başlat
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/register">
              <Button size="xl" className="group text-lg px-10">
                Ücretsiz Üye Ol & Başla
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
          <Link href={user ? "#features" : "/auth/login"}>
            <Button variant="outline" size="xl" className="text-lg">
              {user ? "Nasıl Çalışır?" : (
                <>
                  <Lock className="mr-2 w-4 h-4" />
                  Giriş Yap
                </>
              )}
            </Button>
          </Link>
        </motion.div>

        {/* App Store Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10"
        >
          <p className="text-sm text-slate-500 mb-3 flex items-center justify-center gap-1.5">
            <Smartphone className="w-4 h-4" /> Mobil uygulamamızı indirin
          </p>
          <StoreButtons />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: "10K+", label: "Emsal Karar" },
            { value: "%94", label: "Doğruluk Oranı" },
            { value: "3 dk", label: "Analiz Süresi" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: FileSearch,
      title: "Dava Analizi",
      description:
        "Olayınızı anlatın, yapay zeka hukuki açıdan analiz etsin. Güçlü ve zayıf yanlarınızı öğrenin.",
    },
    {
      icon: Scale,
      title: "Emsal Karşılaştırma",
      description:
        "Davanız, benzer geçmiş mahkeme kararlarıyla otomatik olarak karşılaştırılır.",
    },
    {
      icon: Shield,
      title: "Avukat Dosyası",
      description:
        "Avukatınıza götürebileceğiniz profesyonel bir analiz raporu ve dosya hazırlanır.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            3 basit adımda davanızın hukuki analizini alın
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group p-8 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  const { user } = useAuth();
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-black text-white mb-6">
            Hakkınızı Bilin, Bilinçli Adım Atın
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {user
              ? "Davanızı analiz edin, emsal kararlarla karşılaştırın ve avukatınıza hazırlıklı gidin."
              : "Ücretsiz üye olun, davanızı analiz edin ve avukatınıza hazırlıklı gidin."}
          </p>
          <Link href={user ? "/dashboard" : "/auth/register"}>
            <Button
              size="xl"
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-lg px-10 hover:scale-[1.02]"
            >
              {user ? "Hemen Başla" : "Ücretsiz Üye Ol"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <div className="mt-8">
            <p className="text-sm text-blue-200 mb-3">Mobil uygulamayı indirin</p>
            <StoreButtons />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
