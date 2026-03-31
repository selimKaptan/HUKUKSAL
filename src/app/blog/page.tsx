"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen, Briefcase, Heart, ShoppingCart, AlertTriangle, Home, Scale } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS } from "@/lib/blog-data";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType; gradient: string }> = {
  "İş Hukuku": { bg: "bg-blue-50", text: "text-blue-700", icon: Briefcase, gradient: "from-blue-500 to-indigo-600" },
  "Aile Hukuku": { bg: "bg-pink-50", text: "text-pink-700", icon: Heart, gradient: "from-pink-500 to-rose-600" },
  "Kira Hukuku": { bg: "bg-amber-50", text: "text-amber-700", icon: Home, gradient: "from-amber-500 to-orange-600" },
  "Tüketici Hukuku": { bg: "bg-emerald-50", text: "text-emerald-700", icon: ShoppingCart, gradient: "from-emerald-500 to-teal-600" },
  "Ceza Hukuku": { bg: "bg-red-50", text: "text-red-700", icon: AlertTriangle, gradient: "from-red-500 to-rose-600" },
  "Miras Hukuku": { bg: "bg-violet-50", text: "text-violet-700", icon: Scale, gradient: "from-violet-500 to-purple-600" },
};

export default function BlogPage() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-blue-200 mb-6">
              <BookOpen className="w-4 h-4" /> Hukuk Rehberi
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Haklarınızı Öğrenin</h1>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">Sade ve anlaşılır dille hazırlanmış hukuki rehberler. Avukata gitmeden önce bilmeniz gerekenler.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10">
        {/* Featured / Öne Çıkan Yazı */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href={`/blog/${featured.slug}`}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div className={`md:col-span-2 bg-gradient-to-br ${CATEGORY_COLORS[featured.category]?.gradient || "from-blue-500 to-indigo-600"} p-8 md:p-10 flex flex-col justify-center`}>
                  <Badge className="bg-white/20 text-white border-white/30 w-fit mb-4">{featured.category}</Badge>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{featured.title}</h2>
                </div>
                <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{featured.readTime}</span>
                    <span>{new Date(featured.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</span>
                    <Badge variant="success" className="text-xs">Öne Çıkan</Badge>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">{featured.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                    Yazıyı Oku <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Diğer Yazılar */}
        <div className="grid md:grid-cols-3 gap-6 mt-10 mb-16">
          {rest.map((post, i) => {
            const catStyle = CATEGORY_COLORS[post.category] || { bg: "bg-slate-50", text: "text-slate-700", icon: BookOpen, gradient: "from-slate-500 to-slate-600" };
            const Icon = catStyle.icon;
            return (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <Link href={`/blog/${post.slug}`}>
                  <div className="bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-blue-200 transition-all group h-full flex flex-col overflow-hidden">
                    {/* Üst renk bar */}
                    <div className={`bg-gradient-to-r ${catStyle.gradient} p-5 flex items-center gap-3`}>
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white/80 text-xs">{post.category}</span>
                        <div className="flex items-center gap-2 text-white/60 text-xs">
                          <Clock className="w-3 h-3" />{post.readTime}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">{post.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">{post.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex gap-1.5 flex-wrap">
                          {post.keywords.slice(0, 2).map((kw) => (
                            <span key={kw} className={`text-[10px] ${catStyle.bg} ${catStyle.text} px-2 py-0.5 rounded-full`}>{kw}</span>
                          ))}
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mb-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-10 text-center text-white">
          <h2 className="text-2xl font-black mb-3">Davanızı Hemen Analiz Edin</h2>
          <p className="text-blue-100 mb-6">Yapay zeka ile kazanma ihtimalinizi öğrenin.</p>
          <Link href="/auth/register">
            <button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl shadow-lg transition-all">
              Ücretsiz Başla <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
