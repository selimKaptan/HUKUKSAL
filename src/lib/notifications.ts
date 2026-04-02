"use client";

/**
 * Push Notification Yönetimi
 */

// Service Worker kaydet
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (error) {
    console.error("SW registration failed:", error);
    return null;
  }
}

// Bildirim izni iste
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

// Yerel bildirim gönder (push server olmadan)
export function sendLocalNotification(title: string, body: string, url?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon: "/icons/icon-192x192.svg",
    tag: "haklarim-local",
  });

  if (url) {
    notification.onclick = () => {
      window.focus();
      window.location.href = url;
    };
  }
}

// Günlük ipucu bildirimi zamanla
const NOTIF_KEY = "hklrm_notif_scheduled";

export function scheduleDailyTipNotification() {
  if (typeof window === "undefined") return;

  const lastScheduled = localStorage.getItem(NOTIF_KEY);
  const today = new Date().toISOString().slice(0, 10);

  if (lastScheduled === today) return; // Bugün zaten zamanlandı

  // 10:00'da günlük ipucu bildirimi
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);

  if (now > target) {
    // Bugün 10:00 geçmiş, yarın için zamanla
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();

  setTimeout(() => {
    sendLocalNotification(
      "Günün Hukuk İpucu",
      "Bugünkü hukuk ipucunuz hazır! Haklarınızı öğrenmeye devam edin.",
      "/dashboard"
    );
  }, delay);

  localStorage.setItem(NOTIF_KEY, today);
}
