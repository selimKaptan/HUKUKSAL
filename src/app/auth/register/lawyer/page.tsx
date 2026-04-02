"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, User, ArrowRight, Loader2, Briefcase, MapPin, Phone, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, type LawyerProfile } from "@/lib/auth-context";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { cn } from "@/lib/utils";
import { validateBaroSicilNo, isBaroSicilNoTaken, saveVerificationInfo } from "@/lib/lawyer-verification";

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir", "Trabzon", "Samsun"];
const BAR_ASSOCIATIONS = CITIES.map((c) => `${c} Barosu`);

export default function LawyerRegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Kişisel bilgiler
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mesleki bilgiler
  const [title, setTitle] = useState("");
  const [barAssociation, setBarAssociation] = useState("");
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [specialties, setSpecialties] = useState<CaseCategory[]>([]);
  const [about, setAbout] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [languages, setLanguages] = useState("Türkçe");
  const [baroSicilNo, setBaroSicilNo] = useState("");

  const toggleSpecialty = (cat: CaseCategory) => {
    setSpecialties((prev) =>
      prev.includes(cat) ? prev.filter((s) => s !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (password.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }
      setStep(2);
      return;
    }

    if (specialties.length === 0) { setError("En az bir uzmanlık alanı seçin."); return; }
    if (!barAssociation || !city) { setError("Baro ve şehir bilgisi zorunludur."); return; }

    // Baro sicil no doğrulama
    if (baroSicilNo) {
      const sicilValidation = validateBaroSicilNo(baroSicilNo);
      if (!sicilValidation.valid) { setError(sicilValidation.error!); return; }

      const taken = await isBaroSicilNoTaken(baroSicilNo);
      if (taken) { setError("Bu baro sicil numarası zaten kayıtlı."); return; }
    }

    setLoading(true);

    const lawyerProfile: LawyerProfile = {
      title: title || "Avukat",
      barAssociation,
      city,
      specialties,
      experience: parseInt(experience) || 0,
      phone,
      about,
      consultationFee: consultationFee || "Belirtilmemiş",
      languages: languages.split(",").map((l) => l.trim()),
    };

    const result = await signUp(email, password, name, "lawyer", lawyerProfile);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Baro sicil no varsa doğrulama kaydı oluştur
      if (baroSicilNo) {
        try {
          const user = JSON.parse(localStorage.getItem("jg_user") || "{}");
          if (user.id) {
            await saveVerificationInfo(user.id, baroSicilNo);
          }
        } catch { /* ignore */ }
      }
      router.push("/lawyer/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Haklarım
              <span className="text-sm font-medium text-slate-400 ml-2">Avukat</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Avukat Kaydı</h1>
          <p className="text-slate-500 mt-1">Adım {step}/2 — {step === 1 ? "Kişisel Bilgiler" : "Mesleki Bilgiler"}</p>

          {/* Progress */}
          <div className="flex gap-2 justify-center mt-4">
            <div className={`h-1.5 w-20 rounded-full ${step >= 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
            <div className={`h-1.5 w-20 rounded-full ${step >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Ad Soyad</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Av. Ad Soyad" required className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="avukat@email.com" required className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" required minLength={6} className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/40">
                  <ArrowRight className="w-4 h-4 mr-2" /> Devam Et
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Unvan</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: İş Hukuku Uzmanı" className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Deneyim (Yıl)</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="10" min="0" className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Baro *</label>
                    <select value={barAssociation} onChange={(e) => setBarAssociation(e.target.value)} required className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-emerald-500 outline-none">
                      <option value="">Seçin</option>
                      {BAR_ASSOCIATIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Şehir *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select value={city} onChange={(e) => setCity(e.target.value)} required className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-emerald-500 outline-none">
                        <option value="">Seçin</option>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5XX XXX XX XX" className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Baro Sicil No
                    </label>
                    <input
                      type="text"
                      value={baroSicilNo}
                      onChange={(e) => setBaroSicilNo(e.target.value)}
                      placeholder="Örn: 34-12345"
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400">Doğrulama için gerekli (İl kodu-Sicil no)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Uzmanlık Alanları * <span className="text-slate-400 font-normal">(en az 1 seçin)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CASE_CATEGORY_LABELS) as CaseCategory[]).filter((c) => c !== "diger").map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleSpecialty(cat)}
                        className={cn(
                          "p-2.5 rounded-lg border-2 text-xs font-medium text-left transition-all",
                          specialties.includes(cat)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {CASE_CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Hakkınızda</label>
                  <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Kendinizi ve uzmanlık alanlarınızı tanıtın..." rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 outline-none transition-all resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Danışma Ücreti</label>
                    <input type="text" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="Örn: 500 TL veya Ücretsiz" className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Diller</label>
                    <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Türkçe, İngilizce" className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                    Geri
                  </Button>
                  <Button type="submit" size="lg" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/40" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Briefcase className="w-4 h-4 mr-2" />}
                    {loading ? "Kayıt yapılıyor..." : "Avukat Olarak Kayıt Ol"}
                  </Button>
                </div>
              </>
            )}
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            <Link href="/auth/register" className="text-emerald-600 font-semibold hover:underline">Geri Dön</Link>
            {" | "}
            <Link href="/auth/login" className="text-emerald-600 font-semibold hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
