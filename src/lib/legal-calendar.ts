"use client";

/**
 * Hukuki Takvim - Zamanaşımı hatırlatma + duruşma tarihleri
 */

const CALENDAR_KEY = "hklrm_calendar";

export type EventType = "zamanasimi" | "durusma" | "arabuluculuk" | "itiraz" | "basvuru" | "diger";

export interface LegalEvent {
  id: string;
  title: string;
  date: string; // ISO date
  type: EventType;
  description: string;
  reminderDays: number; // Kaç gün önce hatırlat
  completed: boolean;
  createdAt: string;
}

export function getEvents(): LegalEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CALENDAR_KEY) || "[]");
  } catch { return []; }
}

export function addEvent(data: Omit<LegalEvent, "id" | "completed" | "createdAt">): LegalEvent {
  const events = getEvents();
  const event: LegalEvent = {
    ...data,
    id: `evt_${Date.now()}`,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  events.push(event);
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
  return event;
}

export function toggleEvent(id: string): void {
  const events = getEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx >= 0) {
    events[idx].completed = !events[idx].completed;
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
  }
}

export function deleteEvent(id: string): void {
  const events = getEvents().filter((e) => e.id !== id);
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
}

export function getUpcomingEvents(): LegalEvent[] {
  const today = new Date();
  return getEvents()
    .filter((e) => !e.completed && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getDueReminders(): LegalEvent[] {
  const today = new Date();
  return getEvents().filter((e) => {
    if (e.completed) return false;
    const eventDate = new Date(e.date);
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(reminderDate.getDate() - e.reminderDays);
    return today >= reminderDate && today <= eventDate;
  });
}

// Otomatik zamanaşımı olayı oluştur
export function createStatuteReminder(
  category: string,
  eventDate: string,
  description: string,
  deadlineDays: number
): LegalEvent {
  const deadline = new Date(eventDate);
  deadline.setDate(deadline.getDate() + deadlineDays);

  return addEvent({
    title: `Zamanaşımı: ${category}`,
    date: deadline.toISOString().slice(0, 10),
    type: "zamanasimi",
    description: `${description} - Son tarih: ${deadline.toLocaleDateString("tr-TR")}`,
    reminderDays: 30, // 1 ay önce hatırlat
  });
}

export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; emoji: string; color: string }> = {
  zamanasimi: { label: "Zamanaşımı", emoji: "⏰", color: "text-red-600 bg-red-50" },
  durusma: { label: "Duruşma", emoji: "🏛️", color: "text-blue-600 bg-blue-50" },
  arabuluculuk: { label: "Arabuluculuk", emoji: "🤝", color: "text-emerald-600 bg-emerald-50" },
  itiraz: { label: "İtiraz Süresi", emoji: "⚠️", color: "text-amber-600 bg-amber-50" },
  basvuru: { label: "Başvuru", emoji: "📋", color: "text-indigo-600 bg-indigo-50" },
  diger: { label: "Diğer", emoji: "📌", color: "text-slate-600 bg-slate-50" },
};
