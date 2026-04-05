"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Search, BookOpen, Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GLOSSARY_CATEGORIES,
  searchGlossary,
  getTermsByCategory,
  type GlossaryCategory,
} from "@/lib/legal-glossary";

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory>("Tümü");
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredTerms = useMemo(() => {
    const byCategory = getTermsByCategory(activeCategory);
    if (!query.trim()) return byCategory;
    const searched = searchGlossary(query);
    return searched.filter((t) =>
      activeCategory === "Tümü" ? true : t.category === activeCategory
    );
  }, [query, activeCategory]);

  const scrollToTerm = useCallback((termName: string) => {
    // Reset category to show all so the term is visible
    setActiveCategory("Tümü");
    setQuery("");
    setTimeout(() => {
      const el = termRefs.current[termName];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-blue-400");
        setTimeout(() => el.classList.remove("ring-2", "ring-blue-400"), 2000);
      }
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Haklarım
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-black text-slate-900">Hukuk Terimleri Sözlüğü</h1>
        </div>
        <p className="text-slate-500 mb-8">
          Türk hukukunda sık kullanılan terimlerin tanımları ve ilişkili kavramlar
        </p>

        {/* Search bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Terim veya tanım ara..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GLOSSARY_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="rounded-full"
            >
              <Tag className="w-3.5 h-3.5 mr-1.5" />
              {cat}
            </Button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          {filteredTerms.length} terim bulundu
        </p>

        {/* Term cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTerms.map((term, i) => (
              <motion.div
                key={term.term}
                ref={(el) => { termRefs.current[term.term] = el; }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                className="rounded-xl transition-shadow"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{term.term}</h3>
                      <Badge variant="outline">{term.category}</Badge>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      {term.definition}
                    </p>
                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400 font-medium">İlişkili:</span>
                        {term.relatedTerms.map((rt) => (
                          <button
                            key={rt}
                            onClick={() => scrollToTerm(rt)}
                            className="inline-flex"
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors text-xs"
                            >
                              {rt}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTerms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Aramanızla eşleşen terim bulunamadı.</p>
              <p className="text-slate-400 text-sm mt-1">
                Farklı bir anahtar kelime veya kategori deneyin.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
