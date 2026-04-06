"use client";

import { motion } from "framer-motion";
import { Scale, Shield, FileSearch, ArrowRight, Sparkles, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// Store URL'leri - Yayına alındığında gerçek linklerle değiştirilecek
const APP_STORE_URL = "https://apps.apple.com/tr/app/haklarim";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.haklarim";

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" className="w-6 h-6 fill-current" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-62.1 24-72.5-24 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 512 512" className="w-6 h-6 fill-current" aria-hidden="true">
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
  );
}

function StoreButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 justify-center items-center ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-black hover:bg-gray-800 text-white rounded-xl px-6 py-3.5 transition-all hover:scale-[1.02] shadow-lg min-w-[180px]"
      >
        <AppleIcon />
        <div className="text-left">
          <div className="text-[10px] leading-none opacity-80">Download on the</div>
          <div className="text-lg font-semibold leading-tight">App Store</div>
        </div>
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-black hover:bg-gray-800 text-white rounded-xl px-6 py-3.5 transition-all hover:scale-[1.02] shadow-lg min-w-[180px]"
      >
        <GooglePlayIcon />
        <div className="text-left">
          <div className="text-[10px] leading-none opacity-80">GET IT ON</div>
          <div className="text-lg font-semibold leading-tight">Google Play</div>
        </div>
      </a>
    </div>
  );
}

export { StoreButtons, APP_STORE_URL, PLAY_STORE_URL };

export function HeroSection() {
  const { user } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-10 md:pt-24 md:pb-14">
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
