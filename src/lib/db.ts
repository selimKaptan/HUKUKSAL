/**
 * Supabase DB Servisleri
 * Supabase bağlıysa DB kullanır, yoksa localStorage fallback
 */

import { supabase } from "./supabase";
import type { CaseCategory } from "@/types/database";
import type { User, LawyerProfile } from "./auth-context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

// =============================================
// CASES - Dava kayıtları
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
      const { data: row, error } = await db
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
      const { data, error } = await db
        .from("cases")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as DBCase[];
    } catch { /* fallback */ }
  }

  const cases: DBCase[] = JSON.parse(localStorage.getItem("jg_db_cases") || "[]");
  return cases.filter((c) => c.user_id === userId);
}

export async function deleteCaseDB(caseId: string): Promise<void> {
  if (hasSupabase) {
    try {
      await db.from("cases").delete().eq("id", caseId);
      return;
    } catch { /* fallback */ }
  }

  const cases: DBCase[] = JSON.parse(localStorage.getItem("jg_db_cases") || "[]");
  localStorage.setItem("jg_db_cases", JSON.stringify(cases.filter((c) => c.id !== caseId)));
}

// =============================================
// LAWYERS - Avukat listeleme
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
      let query = db
        .from("lawyer_profiles")
        .select(`
          id,
          title,
          bar_association,
          city,
          specialties,
          experience,
          phone,
          about,
          consultation_fee,
          languages,
          is_verified,
          rating,
          review_count,
          profiles!inner(name, email)
        `)
        .order("rating", { ascending: false });

      if (city) query = query.eq("city", city);
      if (category) query = query.contains("specialties", [category]);

      const { data, error } = await query;
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => {
          const profile = row.profiles as Record<string, string>;
          return {
            id: row.id as string,
            name: profile.name,
            email: profile.email,
            title: row.title as string,
            bar_association: row.bar_association as string,
            city: row.city as string,
            specialties: row.specialties as string[],
            experience: row.experience as number,
            phone: row.phone as string,
            about: row.about as string,
            consultation_fee: row.consultation_fee as string,
            languages: row.languages as string[],
            is_verified: row.is_verified as boolean,
            rating: row.rating as number,
            review_count: row.review_count as number,
          };
        });
      }
    } catch { /* fallback */ }
  }

  // localStorage fallback - mevcut registry'den oku
  const registry: User[] = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  return registry
    .filter((u) => {
      if (!u.lawyerProfile) return false;
      if (category && !u.lawyerProfile.specialties.includes(category)) return false;
      if (city && u.lawyerProfile.city !== city) return false;
      return true;
    })
    .map((u) => ({
      id: u.id,
      name: u.name || "",
      email: u.email,
      title: u.lawyerProfile!.title,
      bar_association: u.lawyerProfile!.barAssociation,
      city: u.lawyerProfile!.city,
      specialties: u.lawyerProfile!.specialties,
      experience: u.lawyerProfile!.experience,
      phone: u.lawyerProfile!.phone,
      about: u.lawyerProfile!.about,
      consultation_fee: u.lawyerProfile!.consultationFee,
      languages: u.lawyerProfile!.languages,
      is_verified: false,
      rating: 0,
      review_count: 0,
    }));
}

export async function updateLawyerProfileDB(userId: string, profile: LawyerProfile): Promise<void> {
  if (hasSupabase) {
    try {
      await db
        .from("lawyer_profiles")
        .update({
          title: profile.title,
          bar_association: profile.barAssociation,
          city: profile.city,
          specialties: profile.specialties,
          experience: profile.experience,
          phone: profile.phone,
          about: profile.about,
          consultation_fee: profile.consultationFee,
          languages: profile.languages,
        })
        .eq("id", userId);
    } catch { /* ignore */ }
  }
}
