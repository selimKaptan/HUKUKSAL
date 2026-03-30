"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Search, Star, MapPin, Briefcase, Phone, Mail, MessageCircle, BadgeCheck, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { findLawyers, type Lawyer } from "@/lib/lawyer-data";
import { getRegisteredLawyers, type User } from "@/lib/auth-context";

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin"];

export default function FindLawyerPage() {
  const [category, setCategory] = useState<CaseCategory | "">("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<{ type: "registered" | "sample"; data: User | Lawyer }[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const combined: { type: "registered" | "sample"; data: User | Lawyer }[] = [];

    // 1. Gerçek kayıtlı avukatlar (öncelikli)
    const registered = getRegisteredLawyers();
    for (const lawyer of registered) {
      if (!lawyer.lawyerProfile) continue;
      const matchCategory = !category || lawyer.lawyerProfile.specialties.includes(category as CaseCategory);
      const matchCity = !city || lawyer.lawyerProfile.city === city;
      if (matchCategory && matchCity) {
        combined.push({ type: "registered", data: lawyer });
      }
    }

    // 2. Örnek avukatlar
    const sampleLawyers = findLawyers(
      category ? category as CaseCategory : undefined,
      city || undefined
    );
    for (const lawyer of sampleLawyers) {
      combined.push({ type: "sample", data: lawyer });
    }

    setResults(combined);
    setSearched(true);
  };

  const registeredCount = results.filter((r) => r.type === "registered").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Justice<span className="text-blue-600">Guard</span></span>
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
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-slate-500">{results.length} avukat bulundu</p>
              {registeredCount > 0 && (
                <Badge variant="success" className="gap-1"><BadgeCheck className="w-3 h-3" /> {registeredCount} Kayıtlı Avukat</Badge>
              )}
            </div>

            {registeredCount > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" /> JusticeGuard Kayıtlı Avukatlar
                </h2>
                <div className="grid gap-4">
                  {results.filter((r) => r.type === "registered").map((r, index) => {
                    const lawyer = r.data as User;
                    const p = lawyer.lawyerProfile!;
                    return (
                      <motion.div key={lawyer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <Card className="border-emerald-200 hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-emerald-50/30">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-5">
                              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <span className="text-2xl font-black text-white">{(lawyer.name || "A").split(" ").map((n) => n[0]).join("").toUpperCase()}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-bold text-slate-900">{lawyer.name}</h3>
                                  <Badge variant="success" className="gap-1 text-xs"><BadgeCheck className="w-3 h-3" /> Dogrulanmis</Badge>
                                </div>
                                <p className="text-sm text-emerald-600 font-medium mb-2">{p.title}</p>
                                {p.about && <p className="text-sm text-slate-600 mb-3">{p.about}</p>}
                                <div className="flex items-center gap-3 flex-wrap mb-3">
                                  <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" /> {p.city} — {p.barAssociation}</span>
                                  {p.experience > 0 && <span className="flex items-center gap-1 text-xs text-slate-500"><Briefcase className="w-3.5 h-3.5" /> {p.experience} yıl</span>}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap mb-3">
                                  {p.specialties.map((s) => <Badge key={s} variant="outline" className="text-xs">{CASE_CATEGORY_LABELS[s]}</Badge>)}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-slate-100">
                                  <Badge variant="default" className="gap-1"><MessageCircle className="w-3 h-3" /> {p.consultationFee}</Badge>
                                  {p.phone && <span className="flex items-center gap-1 text-xs text-slate-500"><Phone className="w-3.5 h-3.5" /> {p.phone}</span>}
                                  <span className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3.5 h-3.5" /> {lawyer.email}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              {registeredCount > 0 && <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-slate-400" /> Diger Avukatlar</h2>}
              <div className="grid gap-4">
                {results.filter((r) => r.type === "sample").map((r, index) => {
                  const lawyer = r.data as Lawyer;
                  return (
                    <motion.div key={lawyer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (registeredCount + index) * 0.05 }}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="text-2xl font-black text-white">{lawyer.name.split(" ").slice(1).map((n) => n[0]).join("")}</span>
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
                                <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" /> {lawyer.city} — {lawyer.barAssociation}</span>
                                <span className="flex items-center gap-1 text-xs text-slate-500"><Briefcase className="w-3.5 h-3.5" /> {lawyer.experience} yıl</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap mb-3">
                                {lawyer.specialties.map((s) => <Badge key={s} variant="outline" className="text-xs">{CASE_CATEGORY_LABELS[s]}</Badge>)}
                              </div>
                              <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-slate-100">
                                <Badge variant="default" className="gap-1"><MessageCircle className="w-3 h-3" /> {lawyer.consultationFee}</Badge>
                                <span className="flex items-center gap-1 text-xs text-slate-500"><Phone className="w-3.5 h-3.5" /> {lawyer.phone}</span>
                                <span className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3.5 h-3.5" /> {lawyer.email}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
