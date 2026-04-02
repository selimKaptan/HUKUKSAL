"use client";

/**
 * Avukat Randevu Sistemi
 */

const APPOINTMENTS_KEY = "hklrm_appointments";

export interface Appointment {
  id: string;
  lawyerId: string;
  lawyerName: string;
  clientId: string;
  clientName: string;
  date: string; // ISO date
  time: string; // HH:mm
  type: "online" | "yüzyüze" | "telefon";
  topic: string;
  status: "bekliyor" | "onaylandi" | "iptal" | "tamamlandi";
  createdAt: string;
}

export function getAppointments(userId: string): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const all: Appointment[] = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]");
    return all
      .filter((a) => a.clientId === userId || a.lawyerId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch { return []; }
}

export function createAppointment(data: Omit<Appointment, "id" | "status" | "createdAt">): Appointment {
  const all: Appointment[] = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]");
  const appointment: Appointment = {
    ...data,
    id: `apt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "bekliyor",
    createdAt: new Date().toISOString(),
  };
  all.push(appointment);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(all));
  return appointment;
}

export function updateAppointmentStatus(id: string, status: Appointment["status"]): void {
  const all: Appointment[] = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]");
  const idx = all.findIndex((a) => a.id === id);
  if (idx >= 0) {
    all[idx].status = status;
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(all));
  }
}

export function getUpcomingAppointments(userId: string): Appointment[] {
  const now = new Date().toISOString().slice(0, 10);
  return getAppointments(userId).filter(
    (a) => a.date >= now && (a.status === "bekliyor" || a.status === "onaylandi")
  );
}
