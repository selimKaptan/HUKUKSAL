"use client";

/**
 * Haklarım - Basit Analitik Sistemi
 * localStorage tabanlı, GDPR/KVKK uyumlu (kişisel veri toplanmaz)
 */

const ANALYTICS_KEY = "hklrm_analytics";

interface AnalyticsData {
  pageViews: Record<string, number>;
  events: Record<string, number>;
  firstVisit: string;
  totalSessions: number;
  lastSession: string;
}

function getData(): AnalyticsData {
  if (typeof window === "undefined") {
    return { pageViews: {}, events: {}, firstVisit: "", totalSessions: 0, lastSession: "" };
  }
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (!stored) {
      const initial: AnalyticsData = {
        pageViews: {},
        events: {},
        firstVisit: new Date().toISOString(),
        totalSessions: 1,
        lastSession: new Date().toISOString(),
      };
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(stored);
  } catch {
    return { pageViews: {}, events: {}, firstVisit: "", totalSessions: 0, lastSession: "" };
  }
}

function saveData(data: AnalyticsData) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  }
}

// Sayfa görüntüleme kaydet
export function trackPageView(page: string) {
  const data = getData();
  data.pageViews[page] = (data.pageViews[page] || 0) + 1;

  // Yeni oturum kontrolü (30dk aralık)
  const lastSession = data.lastSession ? new Date(data.lastSession).getTime() : 0;
  if (Date.now() - lastSession > 30 * 60 * 1000) {
    data.totalSessions += 1;
  }
  data.lastSession = new Date().toISOString();

  saveData(data);
}

// Özel olay kaydet
export function trackEvent(event: string) {
  const data = getData();
  data.events[event] = (data.events[event] || 0) + 1;
  saveData(data);
}

// Analitik özeti (admin için)
export function getAnalyticsSummary(): {
  totalPageViews: number;
  totalSessions: number;
  topPages: { page: string; views: number }[];
  topEvents: { event: string; count: number }[];
  daysSinceFirstVisit: number;
} {
  const data = getData();

  const totalPageViews = Object.values(data.pageViews).reduce((sum, v) => sum + v, 0);

  const topPages = Object.entries(data.pageViews)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const topEvents = Object.entries(data.events)
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const daysSinceFirstVisit = data.firstVisit
    ? Math.floor((Date.now() - new Date(data.firstVisit).getTime()) / 86400000)
    : 0;

  return {
    totalPageViews,
    totalSessions: data.totalSessions,
    topPages,
    topEvents,
    daysSinceFirstVisit,
  };
}

// Yaygın event isimleri
export const EVENTS = {
  ANALYSIS_STARTED: "analysis_started",
  ANALYSIS_COMPLETED: "analysis_completed",
  LAWYER_SEARCHED: "lawyer_searched",
  MESSAGE_SENT: "message_sent",
  PDF_DOWNLOADED: "pdf_downloaded",
  PRO_WALL_SHOWN: "pro_wall_shown",
  PRO_WALL_CLICKED: "pro_wall_clicked",
  LOGIN_COMPLETED: "login_completed",
  REGISTER_COMPLETED: "register_completed",
  TOOL_USED: "tool_used",
  DAILY_TIP_VIEWED: "daily_tip_viewed",
};
