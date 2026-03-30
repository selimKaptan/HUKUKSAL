"use client";

import { AuthProvider } from "@/lib/auth-context";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <PWAInstallPrompt />
    </AuthProvider>
  );
}
