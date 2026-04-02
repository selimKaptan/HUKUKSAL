"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy load - sadece ihtiyaç olduğunda yükle
const AppChat = dynamic(() => import("@/components/app-chat"), { ssr: false });
const LandingPage = dynamic(() => import("@/components/landing-page"), { ssr: false });

export default function HomePage() {
  const [mode, setMode] = useState<"loading" | "app" | "web">("loading");

  useEffect(() => {
    // PWA standalone kontrolü
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);

    // Mobil kontrolü
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;

    setMode(isStandalone || isMobile ? "app" : "web");
  }, []);

  // Yüklenirken boş ekran (flash önleme)
  if (mode === "loading") {
    return <div className="h-[100dvh] bg-[#f5f4ef]" />;
  }

  if (mode === "app") {
    return <AppChat />;
  }

  return <LandingPage />;
}
