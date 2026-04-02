"use client";

import { useState, useEffect } from "react";

/**
 * PWA (standalone) modda mı yoksa normal tarayıcıda mı çalıştığını algılar.
 * - standalone: Ana ekrana eklenmiş uygulama (PWA)
 * - browser: Normal tarayıcı
 * - mobile: Mobil tarayıcı (henüz PWA olarak eklenmemiş)
 */
export type AppMode = "standalone" | "browser" | "mobile";

export function useAppMode(): AppMode {
  const [mode, setMode] = useState<AppMode>("browser");

  useEffect(() => {
    // PWA standalone mode kontrolü
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone) ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setMode("standalone");
      return;
    }

    // Mobil tarayıcı kontrolü
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768);

    if (isMobile) {
      setMode("mobile");
      return;
    }

    setMode("browser");
  }, []);

  return mode;
}

/**
 * PWA veya mobil mi?
 */
export function useIsApp(): boolean {
  const mode = useAppMode();
  return mode === "standalone" || mode === "mobile";
}
