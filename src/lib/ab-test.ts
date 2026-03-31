/**
 * Basit A/B Test Altyapısı
 * Kullanıcıya rastgele variant atar ve sonuçları takip eder
 */

export interface ABTest {
  testId: string;
  variant: "A" | "B";
  assignedAt: string;
}

export interface ABEvent {
  testId: string;
  variant: "A" | "B";
  event: "view" | "click" | "signup" | "analyze";
  timestamp: string;
}

const TESTS_KEY = "jg_ab_tests";
const EVENTS_KEY = "jg_ab_events";

export function getVariant(testId: string): "A" | "B" {
  if (typeof window === "undefined") return "A";

  try {
    const tests: ABTest[] = JSON.parse(localStorage.getItem(TESTS_KEY) || "[]");
    const existing = tests.find((t) => t.testId === testId);
    if (existing) return existing.variant;

    // Yeni kullanıcı - rastgele variant ata
    const variant: "A" | "B" = Math.random() > 0.5 ? "A" : "B";
    tests.push({ testId, variant, assignedAt: new Date().toISOString() });
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
    return variant;
  } catch { return "A"; }
}

export function trackEvent(testId: string, event: "view" | "click" | "signup" | "analyze"): void {
  if (typeof window === "undefined") return;

  try {
    const variant = getVariant(testId);
    const events: ABEvent[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
    events.push({ testId, variant, event, timestamp: new Date().toISOString() });
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-500)));
  } catch { /* ignore */ }
}

export function getABStats(testId: string): { A: Record<string, number>; B: Record<string, number> } {
  if (typeof window === "undefined") return { A: {}, B: {} };

  try {
    const events: ABEvent[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
    const filtered = events.filter((e) => e.testId === testId);

    const stats = { A: {} as Record<string, number>, B: {} as Record<string, number> };
    for (const e of filtered) {
      stats[e.variant][e.event] = (stats[e.variant][e.event] || 0) + 1;
    }
    return stats;
  } catch { return { A: {}, B: {} }; }
}

// Aktif testler
export const ACTIVE_TESTS = {
  HERO_CTA: "hero_cta_v1", // Ana sayfa CTA butonu metni
  PRICING_LAYOUT: "pricing_layout_v1", // Fiyat sayfası düzeni
};
