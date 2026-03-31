"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Markdown from "react-markdown";
import { getBlogPost, BLOG_POSTS } from "@/lib/blog-data";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function BlogPostPage() {
  const params = useParams();
  const post = getBlogPost(params.slug as string);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Yazı Bulunamadı</h1>
          <Link href="/blog"><Button variant="outline">Blog&apos;a Dön</Button></Link>
        </div>
      </div>
    );
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Tüm Yazılar
          </Link>

          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">{post.category}</Badge>
            <span className="flex items-center gap-1.5 text-sm text-blue-300"><Clock className="w-4 h-4" />{post.readTime}</span>
            <span className="flex items-center gap-1.5 text-sm text-blue-300"><Calendar className="w-4 h-4" />{new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">{post.title}</h1>
          <p className="text-lg text-blue-200 leading-relaxed">{post.description}</p>
        </div>
      </div>

      {/* İçerik */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <article className="prose prose-lg prose-slate max-w-none
          prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-200
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base
          prose-li:text-slate-600 prose-li:text-base
          prose-strong:text-slate-900 prose-strong:font-bold
          prose-ul:space-y-1
          prose-ol:space-y-1
          prose-table:border prose-table:border-slate-200 prose-table:rounded-lg prose-table:overflow-hidden
          prose-th:bg-slate-50 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-sm prose-th:font-bold prose-th:text-slate-700
          prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:border-t prose-td:border-slate-100
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-blue-800
          prose-blockquote:rounded-r-xl prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic prose-blockquote:font-medium
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        ">
          <Markdown>{post.content}</Markdown>
        </article>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-10 text-center text-white shadow-2xl shadow-blue-200">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Davanızı Analiz Edin</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">Yapay zeka ile kazanma ihtimalinizi öğrenin, emsal kararlarla karşılaştırın.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg">Ücretsiz Analiz Başlat <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
            <Link href="/ask">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">AI&apos;a Soru Sor</Button>
            </Link>
          </div>
        </div>

        {/* Anahtar Kelimeler */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-slate-400" />
          {post.keywords.map((kw) => (
            <span key={kw} className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">{kw}</span>
          ))}
        </div>

        {/* İlgili Yazılar */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-xl font-black text-slate-900 mb-6">Diğer Yazılar</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedPosts.map((rp) => (
              <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group p-5 border border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all">
                <Badge variant="outline" className="text-xs mb-3">{rp.category}</Badge>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors leading-snug">{rp.title}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{rp.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
