"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed silently
      });
    }

    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // iOS detection
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS guide after 30 seconds
      const timer = setTimeout(() => setShowBanner(true), 30000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop - listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 15000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa_dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-[100] max-w-lg mx-auto"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Haklarım Uygulamasını Yükle
                </h3>
                <button onClick={handleDismiss} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Ana ekranina ekle, uygulama gibi kullan. Hizli erisim, tam ekran deneyim.
              </p>

              {isIOS ? (
                <>
                  {!showIOSGuide ? (
                    <Button size="sm" onClick={() => setShowIOSGuide(true)} className="w-full">
                      <Download className="w-4 h-4 mr-2" /> Nasil Yuklenir?
                    </Button>
                  ) : (
                    <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded-lg">
                      <p><strong>1.</strong> Safari&apos;da asagidaki paylasim butonuna dokunun (kare + ok)</p>
                      <p><strong>2.</strong> &quot;Ana Ekrana Ekle&quot; secenegini bulun</p>
                      <p><strong>3.</strong> &quot;Ekle&quot; butonuna dokunun</p>
                    </div>
                  )}
                </>
              ) : (
                <Button size="sm" onClick={handleInstall} className="w-full">
                  <Download className="w-4 h-4 mr-2" /> Uygulamayi Yukle
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
