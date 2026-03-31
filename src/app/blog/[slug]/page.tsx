"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
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

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8">
            <ArrowLeft className="w-4 h-4" /> Tüm Yazılar
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Badge variant="default">{post.category}</Badge>
              <span className="flex items-center gap-1 text-sm text-slate-400"><Clock className="w-4 h-4" />{post.readTime}</span>
              <span className="flex items-center gap-1 text-sm text-slate-400"><Calendar className="w-4 h-4" />{new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">{post.title}</h1>
            <p className="text-lg text-slate-500">{post.description}</p>
          </div>

          {/* İçerik */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-blue-800 prose-blockquote:rounded-xl prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic prose-a:text-blue-600 prose-table:text-sm">
            <Markdown>{post.content}</Markdown>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Davanızı Analiz Edin</h2>
            <p className="text-blue-100 mb-6">Yapay zeka ile kazanma ihtimalinizi öğrenin, emsal kararlarla karşılaştırın.</p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">Ücretsiz Başla</Button>
            </Link>
          </div>

          {/* Anahtar Kelimeler */}
          <div className="mt-8 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-slate-400" />
            {post.keywords.map((kw) => (
              <span key={kw} className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{kw}</span>
            ))}
          </div>

          {/* İlgili Yazılar */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">İlgili Yazılar</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all">
                    <Badge variant="outline" className="text-xs mb-2">{rp.category}</Badge>
                    <h4 className="font-semibold text-slate-900 text-sm">{rp.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
      <Footer />
    </div>
  );
}
