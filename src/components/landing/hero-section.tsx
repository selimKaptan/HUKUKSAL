"use client";

import { motion } from "framer-motion";
import { Scale, Shield, FileSearch, ArrowRight, MessageCircle, BookOpen, Users, HelpCircle, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-5 py-2 text-sm font-medium text-blue-700 shadow-sm mb-8">
            <Shield className="w-4 h-4" />
            Haklarınızı Bilmek İçin Avukat Olmak Gerekmez
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          Haklarınızı
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Yapay Zeka ile Öğrenin.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Hukuk bilginiz olmasa bile haklarınızı öğrenin.
          <br className="hidden md:block" />
          Ne yapmanız gerektiğini adım adım anlatalım.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/ask">
            <Button size="xl" className="group text-lg px-10">
              <MessageCircle className="mr-2 w-5 h-5" />
              Hemen Sorun
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="xl" className="text-lg">
              Ücretsiz Kayıt Ol
            </Button>
          </Link>
        </motion.div>

        {/* Ne Yapabilirsiniz */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { icon: HelpCircle, text: "Sorunu Anlat" },
            { icon: Scale, text: "Haklarını Öğren" },
            { icon: Gavel, text: "Emsal Kararları Gör" },
            { icon: Users, text: "Avukat Bul" },
          ].map((item) => (
            <div key={item.text} className="flex flex-col items-center gap-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80">
              <item.icon className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">{item.text}</span>
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
      icon: MessageCircle,
      title: "Sorunuzu Sorun",
      description: "Hukuk bilginiz olmasına gerek yok. Sorununuzu kendi cümlelerinizle anlatın, yapay zeka size sade Türkçe ile haklarınızı açıklasın.",
      cta: "AI'a Soru Sor",
      href: "/ask",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: FileSearch,
      title: "Davanızı Analiz Edin",
      description: "Kazanma ihtimalinizi öğrenin. 5 farklı mahkemeden (Yargıtay, Danıştay, AYM, AİHM) emsal kararlarla karşılaştırın.",
      cta: "Analiz Başlat",
      href: "/auth/register",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Shield,
      title: "Haklarınızı Bilin",
      description: "İşten çıkarıldınız mı? Kiracı mısınız? Tüketici hakkınız mı ihlal edildi? Durumunuza özel haklarınızı adım adım öğrenin.",
      cta: "Rehberleri Oku",
      href: "/blog",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Avukat Olmadan Haklarınızı Öğrenin</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Herkesin hukuki haklarını bilme hakkı var. Biz bunu kolaylaştırıyoruz.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}>
              <Link href={feature.href}>
                <div className="group p-8 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed flex-1">{feature.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mt-6 group-hover:gap-3 transition-all">
                    {feature.cta} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Örnek Durumlar */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
          <h3 className="text-2xl font-black text-slate-900 text-center mb-8">Hangi Durumda Olursanız Olun, Size Yardımcı Olabiliriz</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "İşten haksız çıkarıldım",
              "Kiracım kirayı ödemiyor",
              "Boşanma davası açmak istiyorum",
              "İnternetten aldığım ürün bozuk",
              "Sosyal medyada hakaret edildim",
              "Miras paylaşımında hakkım yeniyor",
              "Kira artışı çok yüksek",
              "Trafik kazası mağduruyum",
            ].map((item) => (
              <Link key={item} href="/ask">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all cursor-pointer text-center">
                  {item}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-black text-white mb-6">Haklarınızı Öğrenmek Ücretsiz</h2>
          <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto">
            Hukuk bilginiz olmasa da ne yapmanız gerektiğini adım adım anlatalım.
          </p>
          <p className="text-blue-200 mb-10 max-w-xl mx-auto">
            Avukatlar bazen eksik bilgi verebilir. Kendi haklarınızı bilmek sizin en büyük güvenceniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ask">
              <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-lg px-10 hover:scale-[1.02]">
                <MessageCircle className="mr-2 w-5 h-5" />
                Hemen Soru Sorun
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="xl" className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-10">
                <BookOpen className="mr-2 w-5 h-5" />
                Hukuk Rehberleri
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
