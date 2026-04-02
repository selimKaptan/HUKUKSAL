"use client";

import { supabase } from "./supabase";

const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface LawyerVerificationInfo {
  baroSicilNo: string;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  verifiedAt?: string;
}

// Baro sicil no formatı: Şehir kodu (2 hane) + sicil numarası (4-6 hane)
// Örnek: 34-12345 (İstanbul Barosu, sicil no 12345)
const BARO_SICIL_REGEX = /^\d{2}-\d{4,6}$/;

export function validateBaroSicilNo(sicilNo: string): { valid: boolean; error?: string } {
  if (!sicilNo || !sicilNo.trim()) {
    return { valid: false, error: "Baro sicil numarası zorunludur." };
  }

  const cleaned = sicilNo.trim();

  if (!BARO_SICIL_REGEX.test(cleaned)) {
    return {
      valid: false,
      error: "Geçersiz format. Doğru format: XX-XXXXX (örn: 34-12345)",
    };
  }

  return { valid: true };
}

// Sicil no tekrar kontrolü
export async function isBaroSicilNoTaken(sicilNo: string, excludeUserId?: string): Promise<boolean> {
  if (hasSupabase) {
    try {
      let query = db
        .from("lawyer_profiles")
        .select("id")
        .eq("baro_sicil_no", sicilNo.trim());

      if (excludeUserId) {
        query = query.neq("id", excludeUserId);
      }

      const { data } = await query;
      return data && data.length > 0;
    } catch { /* fallback */ }
  }

  // localStorage fallback
  if (typeof window === "undefined") return false;
  const registry = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  return registry.some(
    (l: { id: string; lawyerProfile?: { baroSicilNo?: string } }) =>
      l.lawyerProfile?.baroSicilNo === sicilNo.trim() &&
      l.id !== excludeUserId
  );
}

// Avukat doğrulama durumunu kaydet
export async function saveVerificationInfo(
  userId: string,
  baroSicilNo: string
): Promise<void> {
  if (hasSupabase) {
    try {
      await db
        .from("lawyer_profiles")
        .update({
          baro_sicil_no: baroSicilNo.trim(),
          verification_status: "pending",
        })
        .eq("id", userId);
      return;
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const registry = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  const idx = registry.findIndex((l: { id: string }) => l.id === userId);
  if (idx >= 0) {
    registry[idx].lawyerProfile = {
      ...registry[idx].lawyerProfile,
      baroSicilNo: baroSicilNo.trim(),
      verificationStatus: "pending",
    };
    localStorage.setItem("jg_lawyer_registry", JSON.stringify(registry));
  }
}

// Doğrulama durumunu getir
export async function getVerificationStatus(userId: string): Promise<LawyerVerificationInfo | null> {
  if (hasSupabase) {
    try {
      const { data } = await db
        .from("lawyer_profiles")
        .select("baro_sicil_no, verification_status, verification_note, verified_at")
        .eq("id", userId)
        .single();

      if (data) {
        return {
          baroSicilNo: data.baro_sicil_no || "",
          verificationStatus: data.verification_status || "pending",
          verificationNote: data.verification_note,
          verifiedAt: data.verified_at,
        };
      }
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const registry = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  const lawyer = registry.find((l: { id: string }) => l.id === userId);
  if (lawyer?.lawyerProfile) {
    return {
      baroSicilNo: lawyer.lawyerProfile.baroSicilNo || "",
      verificationStatus: lawyer.lawyerProfile.verificationStatus || "pending",
    };
  }
  return null;
}

// Admin: Avukat doğrula / reddet
export async function updateVerificationStatus(
  lawyerId: string,
  status: "verified" | "rejected",
  note?: string
): Promise<void> {
  if (hasSupabase) {
    try {
      await db
        .from("lawyer_profiles")
        .update({
          verification_status: status,
          verification_note: note || null,
          verified_at: status === "verified" ? new Date().toISOString() : null,
          is_verified: status === "verified",
        })
        .eq("id", lawyerId);
      return;
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const registry = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  const idx = registry.findIndex((l: { id: string }) => l.id === lawyerId);
  if (idx >= 0) {
    registry[idx].lawyerProfile = {
      ...registry[idx].lawyerProfile,
      verificationStatus: status,
      verificationNote: note,
    };
    localStorage.setItem("jg_lawyer_registry", JSON.stringify(registry));
  }
}

// Admin: Doğrulama bekleyen avukatları listele
export async function getPendingVerifications(): Promise<
  { id: string; name: string; email: string; baroSicilNo: string; barAssociation: string; city: string }[]
> {
  if (hasSupabase) {
    try {
      const { data } = await db
        .from("lawyer_profiles")
        .select(`
          id,
          baro_sicil_no,
          bar_association,
          city,
          profiles!inner(name, email)
        `)
        .eq("verification_status", "pending")
        .not("baro_sicil_no", "is", null);

      if (data) {
        return data.map((row: Record<string, unknown>) => {
          const profile = row.profiles as Record<string, string>;
          return {
            id: row.id as string,
            name: profile.name,
            email: profile.email,
            baroSicilNo: row.baro_sicil_no as string,
            barAssociation: row.bar_association as string,
            city: row.city as string,
          };
        });
      }
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const registry = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  return registry
    .filter(
      (l: { lawyerProfile?: { baroSicilNo?: string; verificationStatus?: string } }) =>
        l.lawyerProfile?.baroSicilNo && l.lawyerProfile?.verificationStatus === "pending"
    )
    .map((l: { id: string; name?: string; email: string; lawyerProfile: { baroSicilNo: string; barAssociation: string; city: string } }) => ({
      id: l.id,
      name: l.name || "",
      email: l.email,
      baroSicilNo: l.lawyerProfile.baroSicilNo,
      barAssociation: l.lawyerProfile.barAssociation,
      city: l.lawyerProfile.city,
    }));
}
