"use client";

export interface CaseReminder {
  id: string;
  caseId: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string; // ISO date
  type: "zamanaşımı" | "duruşma" | "belge_teslim" | "itiraz_süresi" | "temyiz_süresi" | "genel";
  status: "pending" | "completed" | "overdue";
  createdAt: string;
}

export interface CaseTracking {
  id: string;
  caseId: string;
  userId: string;
  caseTitle: string;
  category: string;
  status: "aktif" | "beklemede" | "sonuçlandı" | "temyizde";
  nextHearing?: string; // ISO date
  notes: string[];
  reminders: CaseReminder[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "jg_case_trackings";

function getAllTrackings(): CaseTracking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistTrackings(trackings: CaseTracking[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trackings));
}

export function saveTracking(
  userId: string,
  tracking: Omit<CaseTracking, "id" | "createdAt" | "updatedAt">
): CaseTracking {
  const all = getAllTrackings();
  const now = new Date().toISOString();
  const newTracking: CaseTracking = {
    ...tracking,
    id: `trk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(newTracking);
  persistTrackings(all);
  return newTracking;
}

export function getTrackingsByUser(userId: string): CaseTracking[] {
  return getAllTrackings()
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function updateTracking(trackingId: string, updates: Partial<CaseTracking>): void {
  const all = getAllTrackings();
  const idx = all.findIndex((t) => t.id === trackingId);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  persistTrackings(all);
}

export function deleteTracking(trackingId: string): void {
  const all = getAllTrackings().filter((t) => t.id !== trackingId);
  persistTrackings(all);
}

export function addReminder(
  trackingId: string,
  reminder: Omit<CaseReminder, "id" | "createdAt" | "status">
): CaseReminder {
  const all = getAllTrackings();
  const idx = all.findIndex((t) => t.id === trackingId);
  if (idx === -1) throw new Error("Tracking not found");

  const newReminder: CaseReminder = {
    ...reminder,
    id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  all[idx].reminders.push(newReminder);
  all[idx].updatedAt = new Date().toISOString();
  persistTrackings(all);
  return newReminder;
}

export function completeReminder(trackingId: string, reminderId: string): void {
  const all = getAllTrackings();
  const idx = all.findIndex((t) => t.id === trackingId);
  if (idx === -1) return;
  const rIdx = all[idx].reminders.findIndex((r) => r.id === reminderId);
  if (rIdx === -1) return;
  all[idx].reminders[rIdx].status = "completed";
  all[idx].updatedAt = new Date().toISOString();
  persistTrackings(all);
}

export function getUpcomingReminders(userId: string, daysAhead: number = 7): CaseReminder[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const trackings = getTrackingsByUser(userId);
  const upcoming: CaseReminder[] = [];

  for (const t of trackings) {
    for (const r of t.reminders) {
      if (r.status === "completed") continue;
      const due = new Date(r.dueDate);
      if (due >= now && due <= cutoff) {
        upcoming.push(r);
      }
    }
  }

  return upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function getOverdueReminders(userId: string): CaseReminder[] {
  const now = new Date();
  const trackings = getTrackingsByUser(userId);
  const overdue: CaseReminder[] = [];

  for (const t of trackings) {
    for (const r of t.reminders) {
      if (r.status === "completed") continue;
      const due = new Date(r.dueDate);
      if (due < now) {
        r.status = "overdue";
        overdue.push(r);
      }
    }
  }

  return overdue.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}
