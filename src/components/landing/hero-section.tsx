"use client";

import { motion } from "framer-motion";
import { Scale, Shield, FileSearch, ArrowRight, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

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

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
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
        </motion.div>
      </div>
    </section>
  );
}
