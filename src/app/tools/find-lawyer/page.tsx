"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Search, Star, MapPin, Briefcase, Phone, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { findLawyers, type Lawyer } from "@/lib/lawyer-data";

export default function FindLawyerPage() {
  const [category, setCategory] = useState<CaseCategory | "">("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<Lawyer[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const lawyers = findLawyers(
      category ? category as CaseCategory : undefined,
      city || undefined
    );
    setResults(lawyers);
    setSearched(true);
  };

  const cities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-2">Avukat Bul</h1>
        <p className="text-slate-500 mb-8">Davanıza uygun uzman avukatları bulun</p>

        <Card className="mb-8">
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Uzmanlık Alanı</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as CaseCategory)} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none">
                  <option value="">Tümü</option>
                  {Object.entries(CASE_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Şehir</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none">
                  <option value="">Tümü</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleSearch} size="lg" className="w-full">
              <Search className="w-5 h-5 mr-2" /> Avukat Ara
            </Button>
          </CardContent>
        </Card>

        {searched && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4">{results.length} avukat bulundu</p>
            {results.map((lawyer, index) => (
              <motion.div
                key={lawyer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-2xl font-black text-white">
                          {lawyer.name.split(" ").slice(1).map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{lawyer.name}</h3>
                            <p className="text-sm text-blue-600 font-medium">{lawyer.title}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg flex-shrink-0">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-bold text-amber-700">{lawyer.rating}</span>
                            <span className="text-xs text-amber-500">({lawyer.reviewCount})</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-3">{lawyer.about}</p>

                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5" /> {lawyer.city} — {lawyer.barAssociation}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Briefcase className="w-3.5 h-3.5" /> {lawyer.experience} yıl deneyim
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          {lawyer.specialties.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs">
                              {CASE_CATEGORY_LABELS[s]}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-slate-100">
                          <Badge variant="default" className="gap-1">
                            <MessageCircle className="w-3 h-3" /> {lawyer.consultationFee}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="w-3.5 h-3.5" /> {lawyer.phone}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="w-3.5 h-3.5" /> {lawyer.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 mt-6">
              <strong>Not:</strong> Avukat bilgileri örnek amaçlıdır. Gerçek avukat bilgileri için baronuz veya avukat arama sitelerini kullanınız.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
