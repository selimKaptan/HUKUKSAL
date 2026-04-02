"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { registerServiceWorker, requestNotificationPermission, scheduleDailyTipNotification } from "@/lib/notifications";
import { trackPageView } from "@/lib/analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Service Worker + Notifications
    registerServiceWorker().then(() => {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          scheduleDailyTipNotification();
        }
      });
    });

    // Sayfa görüntüleme analitik
    trackPageView(window.location.pathname);
  }, []);

  return (
    <AuthProvider>
      {children}
      <PWAInstallPrompt />
    </AuthProvider>
  );
}
