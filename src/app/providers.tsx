"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { ErrorBoundary } from "@/components/error-boundary";
import { initErrorMonitoring } from "@/lib/error-monitor";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initErrorMonitoring();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
        <PWAInstallPrompt />
      </AuthProvider>
    </ErrorBoundary>
  );
}
