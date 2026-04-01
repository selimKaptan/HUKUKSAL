/**
 * Supabase DB Servisleri
 * Supabase = tek kaynak (source of truth)
 * localStorage = sadece cache + offline fallback
 */

import { supabase, hasSupabase } from "./supabase";
import type { CaseCategory } from "@/types/database";

// =============================================
// CASES
// =============================================

export interface DBCase {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  category: CaseCategory;
  event_summary: string;
  additional_notes?: string;
  win_probability?: number;
  analysis_report?: string;
  strengths?: string[];
  weaknesses?: string[];
  risk_factors?: string[];
  suggested_actions?: string[];
  recommendation?: string;
  estimated_duration_days?: number;
  ai_provider?: string;
  status: string;
}

// Cache helper
function cacheSet(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* storage full */ }
}
function cacheGet<T>(key: string): T | null {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch { return null; }
}

export async function saveCase(userId: string, data: Omit<DBCase, "id" | "created_at" | "status">): Promise<DBCase | null> {
  const localCase: DBCase = { ...data, id: `case_${Date.now()}`, created_at: new Date().toISOString(), user_id: userId, status: "completed" };

  // Supabase'e kaydet (birincil)
  if (hasSupabase) {
    try {
      const { data: row, error } = await supabase
        .from("cases")
        .insert({ ...data, user_id: userId, status: "completed" })
        .select()
        .single();
      if (!error && row) {
        // Cache'i güncelle
        const cached = cacheGet<DBCase[]>(`jg_cases_${userId}`) || [];
        cached.unshift(row as DBCase);
        cacheSet(`jg_cases_${userId}`, cached);
        return row as DBCase;
      }
    } catch { /* fallback */ }
  }

  // Fallback: localStorage
  const cached = cacheGet<DBCase[]>(`jg_cases_${userId}`) || [];
  cached.unshift(localCase);
  cacheSet(`jg_cases_${userId}`, cached);
  return localCase;
}

export async function getCasesByUserId(userId: string): Promise<DBCase[]> {
  // Supabase'den oku (birincil)
  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        // Cache'i güncelle
        cacheSet(`jg_cases_${userId}`, data);
        return data as DBCase[];
      }
    } catch { /* fallback to cache */ }
  }

  // Fallback: cache'den oku
  return cacheGet<DBCase[]>(`jg_cases_${userId}`) || [];
}

export async function deleteCaseDB(caseId: string, userId?: string): Promise<void> {
  if (hasSupabase) {
    try { await supabase.from("cases").delete().eq("id", caseId); } catch { /* */ }
  }
  // Cache'den de sil
  if (userId) {
    const cached = cacheGet<DBCase[]>(`jg_cases_${userId}`) || [];
    cacheSet(`jg_cases_${userId}`, cached.filter((c) => c.id !== caseId));
  }
}

// =============================================
// LAWYERS
// =============================================

export interface DBLawyer {
  id: string;
  name: string;
  email: string;
  title: string;
  bar_association: string;
  city: string;
  specialties: string[];
  experience: number;
  phone: string;
  about: string;
  consultation_fee: string;
  languages: string[];
  is_verified: boolean;
  rating: number;
  review_count: number;
}

export async function getRegisteredLawyersDB(category?: CaseCategory, city?: string): Promise<DBLawyer[]> {
  if (hasSupabase) {
    try {
      let query = supabase
        .from("lawyer_profiles")
        .select(`id, title, bar_association, city, specialties, experience, phone, about, consultation_fee, languages, is_verified, rating, review_count, profiles!inner(name, email)`)
        .order("rating", { ascending: false });
      if (city) query = query.eq("city", city);
      if (category) query = query.contains("specialties", [category]);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => {
          const profile = row.profiles as Record<string, string>;
          return {
            id: row.id as string, name: profile?.name || "", email: profile?.email || "",
            title: (row.title as string) || "Avukat", bar_association: (row.bar_association as string) || "",
            city: (row.city as string) || "", specialties: (row.specialties as string[]) || [],
            experience: (row.experience as number) || 0, phone: (row.phone as string) || "",
            about: (row.about as string) || "", consultation_fee: (row.consultation_fee as string) || "",
            languages: (row.languages as string[]) || ["Türkçe"],
            is_verified: (row.is_verified as boolean) || false,
            rating: (row.rating as number) || 0, review_count: (row.review_count as number) || 0,
          };
        });
      }
    } catch { /* fallback */ }
  }
  return [];
}

// =============================================
// MESSAGES - Supabase öncelikli
// =============================================

export async function saveMessageDB(senderId: string, receiverId: string, content: string): Promise<void> {
  if (hasSupabase) {
    try {
      await supabase.from("messages").insert({ sender_id: senderId, receiver_id: receiverId, content, read: false });
    } catch { /* fallback in messaging.ts */ }
  }
}

export async function getMessagesDB(userId1: string, userId2: string): Promise<{ id: string; created_at: string; sender_id: string; receiver_id: string; content: string; read: boolean }[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order("created_at", { ascending: true });
      if (!error && data) return data;
    } catch { /* fallback */ }
  }
  return [];
}
