"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ArrowLeft, FileText, Copy, Check, ChevronDown, ChevronUp, MapPin, Banknote, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_TEMPLATES, type DocumentTemplate } from "@/lib/document-templates";

export default function DilekcePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyTemplate = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const difficultyColor = { kolay: "bg-emerald-100 text-emerald-700", orta: "bg-amber-100 text-amber-700", zor: "bg-red-100 text-red-700" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-slate-900">Haklarım</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Dilekçelerim
          </h1>
          <p className="text-sm text-slate-500 mt-1">Avukata gerek kalmadan hazır dilekçe şablonları</p>
        </div>

        <div className="space-y-3">
          {DOCUMENT_TEMPLATES.map((doc) => (
            <TemplateCard
              key={doc.id}
              doc={doc}
              expanded={expandedId === doc.id}
              copied={copiedId === doc.id}
              onToggle={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
              onCopy={() => copyTemplate(doc.id, doc.template)}
              difficultyColor={difficultyColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ doc, expanded, copied, onToggle, onCopy, difficultyColor }: {
  doc: DocumentTemplate; expanded: boolean; copied: boolean; onToggle: () => void; onCopy: () => void;
  difficultyColor: Record<string, string>;
}) {
  return (
    <motion.div layout>
      <Card className="overflow-hidden">
        <button onClick={onToggle} className="w-full text-left">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{doc.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
                  <Badge className={`text-[10px] ${difficultyColor[doc.difficulty]}`}>{doc.difficulty}</Badge>
                </div>
                <p className="text-xs text-slate-500">{doc.description}</p>
                <p className="text-[10px] text-slate-400 mt-1">{doc.category}</p>
              </div>
              {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </CardContent>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <div className="px-4 pb-4 space-y-4">
                {/* Adımlar */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Adım adım ne yapmalısınız:</h4>
                  <div className="space-y-2">
                    {doc.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-blue-600">{i + 1}</span>
                        </div>
                        <p className="text-xs text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bilgi kartları */}
                <div className="grid grid-cols-2 gap-2">
                  {doc.deadline && (
                    <div className="bg-red-50 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-bold text-red-600">Süre</span>
                      </div>
                      <p className="text-xs text-red-700">{doc.deadline}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-600">Nereye</span>
                    </div>
                    <p className="text-xs text-blue-700">{doc.whereToSubmit}</p>
                  </div>
                  {doc.cost && (
                    <div className="bg-amber-50 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Banknote className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600">Maliyet</span>
                      </div>
                      <p className="text-xs text-amber-700">{doc.cost}</p>
                    </div>
                  )}
                </div>

                {/* Gerekli belgeler */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Gerekli belgeler:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.requiredDocs.map((d) => (
                      <span key={d} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Şablon */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-700">Dilekçe Şablonu</h4>
                    <Button size="sm" variant="outline" onClick={onCopy} className="h-7 text-xs gap-1">
                      {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Kopyalandı</> : <><Copy className="w-3 h-3" /> Kopyala</>}
                    </Button>
                  </div>
                  <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
                    {doc.template}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
