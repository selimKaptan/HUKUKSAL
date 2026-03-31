"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS } from "@/lib/blog-data";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-3">Hukuk Rehberi</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Haklarınızı öğrenin. Sade ve anlaşılır dille hazırlanmış hukuki rehberler.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {BLOG_POSTS.map((post, i) => (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/blog/${post.slug}`}>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all group h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                    <p className="text-sm text-slate-500 mb-4 flex-1">{post.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {post.keywords.slice(0, 3).map((kw) => (
                          <span key={kw} className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
