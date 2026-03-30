"use client";

import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection, FeaturesSection, CTASection } from "@/components/landing/hero-section";
import { Footer } from "@/components/landing/footer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      // Giriş yapmış kullanıcıyı rolüne göre yönlendir
      if (user.role === "lawyer") {
        router.replace("/lawyer/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  // Giriş yapmış kullanıcı yönlendirilirken loading göster
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  // Giriş yapmamış kullanıcılar landing page görür
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
