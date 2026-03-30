"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection, FeaturesSection, CTASection } from "@/components/landing/hero-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
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
