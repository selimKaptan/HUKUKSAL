/**
 * Supabase DB Servisleri
 * Supabase bağlıysa DB kullanır, yoksa localStorage fallback
 */

import { supabase, hasSupabase } from "./supabase";
import type { CaseCategory } from "@/types/database";
import type { LawyerProfile } from "./auth-context";

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

export async function saveCase(userId: string, data: Omit<DBCase, "id" | "created_at" | "status">): Promise<DBCase | null> {
  if (hasSupabase) {
    try {
      const { data: row, error } = await supabase
        .from("cases")
        .insert({ ...data, user_id: userId, status: "completed" })
        .select()
        .single();
      if (!error && row) return row as DBCase;
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const cases: DBCase[] = JSON.parse(localStorage.getItem("jg_db_cases") || "[]");
  const newCase: DBCase = {
    ...data,
    id: `case_${Date.now()}`,
    created_at: new Date().toISOString(),
    user_id: userId,
    status: "completed",
  };
  cases.unshift(newCase);
  localStorage.setItem("jg_db_cases", JSON.stringify(cases));
  return newCase;
}

export async function getCasesByUserId(userId: string): Promise<DBCase[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) return data as DBCase[];
    } catch { /* fallback */ }
  }

  const cases: DBCase[] = JSON.parse(localStorage.getItem("jg_db_cases") || "[]");
  return cases.filter((c) => c.user_id === userId);
}

export async function deleteCaseDB(caseId: string): Promise<void> {
  if (hasSupabase) {
    try {
      await supabase.from("cases").delete().eq("id", caseId);
    } catch { /* fallback */ }
  }

  const cases: DBCase[] = JSON.parse(localStorage.getItem("jg_db_cases") || "[]");
  localStorage.setItem("jg_db_cases", JSON.stringify(cases.filter((c) => c.id !== caseId)));
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
            id: row.id as string,
            name: profile?.name || "",
            email: profile?.email || "",
            title: (row.title as string) || "Avukat",
            bar_association: (row.bar_association as string) || "",
            city: (row.city as string) || "",
            specialties: (row.specialties as string[]) || [],
            experience: (row.experience as number) || 0,
            phone: (row.phone as string) || "",
            about: (row.about as string) || "",
            consultation_fee: (row.consultation_fee as string) || "",
            languages: (row.languages as string[]) || ["Türkçe"],
            is_verified: (row.is_verified as boolean) || false,
            rating: (row.rating as number) || 0,
            review_count: (row.review_count as number) || 0,
          };
        });
      }
    } catch { /* fallback */ }
  }

  return []; // localStorage fallback find-lawyer sayfasında zaten yapılıyor
}

export async function updateLawyerProfileDB(userId: string, profile: LawyerProfile): Promise<void> {
  if (hasSupabase) {
    try {
      await supabase.from("lawyer_profiles").update({
        title: profile.title,
        bar_association: profile.barAssociation,
        city: profile.city,
        specialties: profile.specialties,
        experience: profile.experience,
        phone: profile.phone,
        about: profile.about,
        consultation_fee: profile.consultationFee,
        languages: profile.languages,
      }).eq("id", userId);
    } catch { /* ignore */ }
  }
}

// =============================================
// MESSAGES
// =============================================

export interface DBMessage {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
}

export async function saveMessageDB(senderId: string, receiverId: string, content: string): Promise<void> {
  if (hasSupabase) {
    try {
      await supabase.from("messages").insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false,
      });
    } catch { /* fallback to localStorage in messaging.ts */ }
  }
}

export async function getMessagesDB(userId1: string, userId2: string): Promise<DBMessage[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order("created_at", { ascending: true });
      if (!error && data) return data as DBMessage[];
    } catch { /* fallback */ }
  }
  return [];
}
