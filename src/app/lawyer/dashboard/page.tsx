"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, Briefcase, MapPin, Star, Phone, Mail, Clock, Edit, Users, TrendingUp, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { CASE_CATEGORY_LABELS } from "@/types/database";

export default function LawyerDashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "lawyer")) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "lawyer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  const profile = user.lawyerProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Haklarım
              <span className="text-xs font-medium text-slate-400 ml-1.5">Avukat Paneli</span>
            </span>
          </Link>
          <Button variant="outline" size="sm" onClick={() => { signOut(); router.push("/"); }}>
            Çıkış Yap
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Profil Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl font-black text-white">
                {(user.name || "A").split(" ").map((n) => n[0]).join("").toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                  <p className="text-emerald-600 font-medium">{profile?.title || "Avukat"}</p>
                </div>
                <Link href="/lawyer/profile">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" /> Profili Düzenle
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {profile?.barAssociation && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Briefcase className="w-4 h-4" /> {profile.barAssociation}
                  </span>
                )}
                {profile?.city && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" /> {profile.city}
                  </span>
                )}
                {profile?.experience ? (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Clock className="w-4 h-4" /> {profile.experience} yıl deneyim
                  </span>
                ) : null}
                {profile?.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Phone className="w-4 h-4" /> {profile.phone}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {profile?.specialties?.map((s) => (
                  <Badge key={s} variant="default" className="bg-emerald-100 text-emerald-700 border-0">
                    {CASE_CATEGORY_LABELS[s]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {profile?.about && (
            <p className="mt-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {profile.about}
            </p>
          )}
        </motion.div>

        {/* İstatistik Kartları */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <div className="text-3xl font-black text-emerald-700">0</div>
                <p className="text-sm text-slate-500 mt-1">Müvekkil Talebi</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-black text-blue-700">0</div>
                <p className="text-sm text-slate-500 mt-1">Profil Görüntüleme</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                <div className="text-3xl font-black text-amber-700">-</div>
                <p className="text-sm text-slate-500 mt-1">Ortalama Puan</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bilgi kartları */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-400" /> İletişim Bilgileri
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">E-posta</span><span className="text-slate-700">{user.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Telefon</span><span className="text-slate-700">{profile?.phone || "Belirtilmemiş"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Danışma Ücreti</span><span className="text-slate-700">{profile?.consultationFee || "Belirtilmemiş"}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-400" /> Görünürlük
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                Profiliniz müvekkillerin &quot;Avukat Bul&quot; sayfasında uzmanlık alanlarınıza göre listelenmektedir.
              </p>
              <Badge variant="success">Profil Aktif</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
