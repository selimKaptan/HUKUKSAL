"use client";

import { useIsApp } from "@/lib/use-app-mode";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection, FeaturesSection, CTASection } from "@/components/landing/hero-section";
import { Footer } from "@/components/landing/footer";
import AppChat from "@/components/app-chat";

export default function HomePage() {
  const isApp = useIsApp();

  // PWA veya mobil → Chat arayüzü
  if (isApp) {
    return <AppChat />;
  }

  // Desktop tarayıcı → Landing page
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
