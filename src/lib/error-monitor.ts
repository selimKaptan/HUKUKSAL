/**
 * Basit Error Monitoring - Hataları loglar ve localStorage'da saklar
 * Production'da Sentry ile değiştirilebilir
 */

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userId?: string;
}

const ERRORS_KEY = "jg_errors";

export function logError(error: Error | string, userId?: string): void {
  if (typeof window === "undefined") return;

  const errorLog: ErrorLog = {
    id: `err_${Date.now()}`,
    message: typeof error === "string" ? error : error.message,
    stack: typeof error === "string" ? undefined : error.stack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userId,
  };

  try {
    const errors: ErrorLog[] = JSON.parse(localStorage.getItem(ERRORS_KEY) || "[]");
    errors.unshift(errorLog);
    // Son 50 hatayı sakla
    localStorage.setItem(ERRORS_KEY, JSON.stringify(errors.slice(0, 50)));
  } catch { /* storage full */ }

  // Console'a da yaz
  console.error("[JusticeGuard Error]", errorLog.message, errorLog.stack);
}

export function getErrors(): ErrorLog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ERRORS_KEY) || "[]");
  } catch { return []; }
}

export function clearErrors(): void {
  localStorage.removeItem(ERRORS_KEY);
}

// Global error handler
export function initErrorMonitoring(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    logError(event.error || event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    logError(event.reason?.message || "Unhandled Promise Rejection");
  });
}
