"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function ClientRegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, name, "client");
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Müvekkil Kaydı</h1>
          <p className="text-slate-500 mt-1">Davanızı analiz ettirmek için kayıt olun</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" required className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" required className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" required minLength={6} className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
              {loading ? "Kayıt yapılıyor..." : "Müvekkil Olarak Kayıt Ol"}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">Geri Dön</Link>
            {" | "}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
