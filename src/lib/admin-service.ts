"use client";

import type { CaseCategory } from "@/types/database";

// =============================================
// Admin servis fonksiyonları
// Tüm kullanıcı, dava ve sistem verilerine erişim
// =============================================

export interface AdminStats {
  totalUsers: number;
  totalLawyers: number;
  totalClients: number;
  totalCases: number;
  totalCasesToday: number;
  claudeAnalysisCount: number;
  localAnalysisCount: number;
  avgWinProbability: number;
  categoryDistribution: Record<string, number>;
  recentCases: AdminCaseView[];
  recentUsers: AdminUserView[];
}

export interface AdminUserView {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  caseCount: number;
}

export interface AdminCaseView {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  category: CaseCategory;
  winProbability: number;
  recommendation: string;
  aiProvider: string;
  createdAt: string;
}

interface StoredUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at?: string;
  lawyerProfile?: unknown;
  password?: string;
}

interface StoredCase {
  id: string;
  userId: string;
  title: string;
  category: CaseCategory;
  eventSummary: string;
  result: {
    winProbability: number;
    recommendation: string;
  };
  createdAt: string;
  aiProvider: string;
}

interface DBCase {
  id: string;
  user_id: string;
  title: string;
  category: CaseCategory;
  event_summary: string;
  win_probability?: number;
  recommendation?: string;
  ai_provider?: string;
  created_at: string;
}

/**
 * Tüm kullanıcıları getir
 */
export function getAllUsers(): AdminUserView[] {
  if (typeof window === "undefined") return [];
  try {
    const users: StoredUser[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
    const cases: StoredCase[] = JSON.parse(localStorage.getItem("jg_cases") || "[]");
    const dbCases: DBCase[] = JSON.parse(localStorage.getItem("jg_db_cases") || "[]");

    return users.map((u) => {
      const userCases = cases.filter((c) => c.userId === u.id);
      const userDbCases = dbCases.filter((c) => c.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        name: u.name || "İsimsiz",
        role: u.role || "client",
        created_at: u.created_at || "",
        caseCount: Math.max(userCases.length, userDbCases.length),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Tüm davaları getir
 */
export function getAllCases(): AdminCaseView[] {
  if (typeof window === "undefined") return [];
  try {
    const users: StoredUser[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
    const userMap = new Map(users.map((u) => [u.id, u]));

    // localStorage cases
    const cases: StoredCase[] = JSON.parse(localStorage.getItem("jg_cases") || "[]");
    const caseViews: AdminCaseView[] = cases.map((c) => {
      const user = userMap.get(c.userId);
      return {
        id: c.id,
        userId: c.userId,
        userName: user?.name || "Bilinmeyen",
        userEmail: user?.email || "",
        title: c.title,
        category: c.category,
        winProbability: c.result?.winProbability || 0,
        recommendation: c.result?.recommendation || "needs_review",
        aiProvider: c.aiProvider || "local",
        createdAt: c.createdAt,
      };
    });

    // DB cases (localStorage fallback)
    const dbCases: DBCase[] = JSON.parse(localStorage.getItem("jg_db_cases") || "[]");
    const existingIds = new Set(caseViews.map((c) => c.id));
    dbCases.forEach((c) => {
      if (existingIds.has(c.id)) return;
      const user = userMap.get(c.user_id);
      caseViews.push({
        id: c.id,
        userId: c.user_id,
        userName: user?.name || "Bilinmeyen",
        userEmail: user?.email || "",
        title: c.title,
        category: c.category,
        winProbability: c.win_probability || 0,
        recommendation: c.recommendation || "needs_review",
        aiProvider: c.ai_provider || "local",
        createdAt: c.created_at,
      });
    });

    // Tarihe göre sırala (en yeni önce)
    caseViews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return caseViews;
  } catch {
    return [];
  }
}

/**
 * Admin istatistiklerini hesapla
 */
export function getAdminStats(): AdminStats {
  const users = getAllUsers();
  const cases = getAllCases();
  const today = new Date().toISOString().split("T")[0];

  const categoryDistribution: Record<string, number> = {};
  let totalWinProb = 0;
  let claudeCount = 0;
  let localCount = 0;
  let todayCount = 0;

  cases.forEach((c) => {
    categoryDistribution[c.category] = (categoryDistribution[c.category] || 0) + 1;
    totalWinProb += c.winProbability;
    if (c.aiProvider === "claude") claudeCount++;
    else localCount++;
    if (c.createdAt.startsWith(today)) todayCount++;
  });

  return {
    totalUsers: users.length,
    totalLawyers: users.filter((u) => u.role === "lawyer").length,
    totalClients: users.filter((u) => u.role === "client").length,
    totalCases: cases.length,
    totalCasesToday: todayCount,
    claudeAnalysisCount: claudeCount,
    localAnalysisCount: localCount,
    avgWinProbability: cases.length > 0 ? Math.round(totalWinProb / cases.length) : 0,
    categoryDistribution,
    recentCases: cases.slice(0, 20),
    recentUsers: users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 20),
  };
}

/**
 * Kullanıcı sil
 */
export function deleteUser(userId: string): void {
  if (typeof window === "undefined") return;
  // Users
  const users: StoredUser[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
  localStorage.setItem("jg_users", JSON.stringify(users.filter((u) => u.id !== userId)));
  // Cases
  const cases: StoredCase[] = JSON.parse(localStorage.getItem("jg_cases") || "[]");
  localStorage.setItem("jg_cases", JSON.stringify(cases.filter((c) => c.userId !== userId)));
  // DB Cases
  const dbCases: DBCase[] = JSON.parse(localStorage.getItem("jg_db_cases") || "[]");
  localStorage.setItem("jg_db_cases", JSON.stringify(dbCases.filter((c) => c.user_id !== userId)));
  // Lawyer registry
  const lawyers: StoredUser[] = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  localStorage.setItem("jg_lawyer_registry", JSON.stringify(lawyers.filter((l) => l.id !== userId)));
}

/**
 * Kullanıcı rolünü değiştir
 */
export function updateUserRole(userId: string, newRole: string): void {
  if (typeof window === "undefined") return;
  const users: StoredUser[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
  const idx = users.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    users[idx].role = newRole;
    localStorage.setItem("jg_users", JSON.stringify(users));
  }
}
