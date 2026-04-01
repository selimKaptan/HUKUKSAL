"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowLeft, Save, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, type LawyerProfile } from "@/lib/auth-context";
import { BARO_LIST } from "@/lib/baro-verify";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";

const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Gaziantep",
  "Konya",
  "Mersin",
  "Kayseri",
  "Eskişehir",
  "Diyarbakır",
  "Samsun",
  "Denizli",
  "Trabzon",
  "Muğla",
  "Manisa",
  "Kocaeli",
  "Sakarya",
  "Tekirdağ",
  "Hatay",
  "Malatya",
  "Erzurum",
  "Van",
  "Şanlıurfa",
];

const defaultProfile: LawyerProfile = {
  title: "",
  barAssociation: "",
  city: "",
  experience: 0,
  phone: "",
  specialties: [],
  about: "",
  consultationFee: "",
  languages: [],
};

export default function LawyerProfilePage() {
  const router = useRouter();
  const { user, loading, updateLawyerProfile } = useAuth();
  const [profile, setProfile] = useState<LawyerProfile>(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "lawyer")) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.lawyerProfile) {
      setProfile(user.lawyerProfile);
    }
  }, [user]);

  if (loading || !user || user.role !== "lawyer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  const handleSpecialtyToggle = (category: CaseCategory) => {
    setProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(category)
        ? prev.specialties.filter((s) => s !== category)
        : [...prev.specialties, category],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      updateLawyerProfile(profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all";
  const labelClass = "text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-emerald-600">Guard</span>
            </span>
          </Link>
          <Link href="/lawyer/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Panele Dön
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Profil Düzenle</h1>
          <p className="text-slate-500 mt-1">
            Profil bilgilerinizi güncelleyerek müvekkillerin sizi daha kolay bulmasını sağlayın.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Profiliniz başarıyla güncellendi.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className={labelClass}>Unvan</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                placeholder="Örn: İş Hukuku Uzmanı"
                className={inputClass}
              />
            </div>

            {/* Bar Association & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Baro</label>
                <select
                  value={profile.barAssociation}
                  onChange={(e) => setProfile({ ...profile, barAssociation: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Baro seçin</option>
                  {BARO_LIST.map((baro) => (
                    <option key={baro} value={baro}>
                      {baro}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Şehir</label>
                <select
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Şehir seçin</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Deneyim (Yıl)</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={profile.experience}
                  onChange={(e) =>
                    setProfile({ ...profile, experience: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Deneyim yılı"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Telefon</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+90 5XX XXX XX XX"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-3">
              <label className={labelClass}>Uzmanlık Alanları</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.entries(CASE_CATEGORY_LABELS) as [CaseCategory, string][]).map(
                  ([key, label]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        profile.specialties.includes(key)
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={profile.specialties.includes(key)}
                        onChange={() => handleSpecialtyToggle(key)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* About */}
            <div className="space-y-2">
              <label className={labelClass}>Hakkımda</label>
              <textarea
                value={profile.about}
                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                placeholder="Kendinizi ve deneyimlerinizi kısaca tanıtın..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
              />
            </div>

            {/* Consultation Fee & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Danışmanlık Ücreti</label>
                <input
                  type="text"
                  value={profile.consultationFee}
                  onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                  placeholder="Örn: 500 TL veya İlk görüşme ücretsiz"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Diller (virgülle ayırın)</label>
                <input
                  type="text"
                  value={profile.languages.join(", ")}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      languages: e.target.value
                        .split(",")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Türkçe, İngilizce"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Link href="/lawyer/dashboard">
              <Button type="button" variant="outline">
                İptal
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
