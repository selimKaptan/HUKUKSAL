"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, hasSupabase } from "./supabase";
import type { CaseCategory } from "@/types/database";

export type UserRole = "client" | "lawyer" | "admin";

// Admin e-posta adresleri - bu hesaplar sınırsız yetkiye sahip
const ADMIN_EMAILS = ["selim@barbarosshipping.com"];

export interface LawyerProfile {
  barAssociation: string;
  city: string;
  specialties: CaseCategory[];
  experience: number;
  phone: string;
  about: string;
  consultationFee: string;
  languages: string[];
  title: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  created_at?: string;
  lawyerProfile?: LawyerProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole, lawyerProfile?: LawyerProfile) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateLawyerProfile: (profile: LawyerProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  updateLawyerProfile: () => {},
});

export function checkIsAdmin(email?: string): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Init: check session
  useEffect(() => {
    // 1. LocalStorage'dan hızlı yükle (flash önleme)
    const stored = localStorage.getItem("jg_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Admin kontrolü - her oturumda kontrol et
        if (checkIsAdmin(parsed.email)) {
          parsed.role = "admin";
        }
        setUser(parsed);
      } catch {
        localStorage.removeItem("jg_user");
      }
    }

    // 2. Supabase session kontrol
    if (hasSupabase) {
      import("./supabase").then(({ supabase }) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const email = session.user.email || "";
            const u: User = {
              id: session.user.id,
              email,
              name: session.user.user_metadata?.name,
              role: checkIsAdmin(email) ? "admin" : (session.user.user_metadata?.role || "client"),
              lawyerProfile: session.user.user_metadata?.lawyerProfile,
            };
            setUser(u);
            localStorage.setItem("jg_user", JSON.stringify(u));
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      }).catch(() => setLoading(false));

      // Auth state değişikliklerini dinle
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name,
            role: session.user.user_metadata?.role || "client",
            lawyerProfile: session.user.user_metadata?.lawyerProfile,
          };
          setUser(u);
          saveUserLocal(u);
        } else if (!localStorage.getItem("jg_user")) {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, role: UserRole, lawyerProfile?: LawyerProfile) => {
    // Supabase Auth
    if (hasSupabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role, lawyerProfile } },
      });

      if (error) {
        // Supabase hata verirse localStorage fallback
        return localSignUp(email, password, name, role, lawyerProfile);
      }

      if (data.user) {
        const u: User = { id: data.user.id, email, name, role, lawyerProfile, created_at: new Date().toISOString() };
        setUser(u);
        saveUserLocal(u);
        if (role === "lawyer" && lawyerProfile) saveLawyerToRegistry(u);
        return {};
      }
    }

    return localSignUp(email, password, name, role, lawyerProfile);
  }, []);

  // localStorage fallback signup
  const localSignUp = (email: string, password: string, name: string, role: UserRole, lawyerProfile?: LawyerProfile) => {
    const existingUsers: (User & { password: string })[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
    if (existingUsers.find((u) => u.email === email)) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }
    const newUser: User = { id: `local_${Date.now()}`, email, name, role, lawyerProfile, created_at: new Date().toISOString() };
    existingUsers.push({ ...newUser, password });
    localStorage.setItem("jg_users", JSON.stringify(existingUsers));
    setUser(newUser);
    saveUserLocal(newUser);
    if (role === "lawyer" && lawyerProfile) saveLawyerToRegistry(newUser);
    return {};
  };

  const signIn = useCallback(async (email: string, password: string) => {
    // Supabase Auth
    if (hasSupabase) {
      try {
        const { supabase } = await import("./supabase");
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const u: User = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name,
            role: checkIsAdmin(email) ? "admin" : (data.user.user_metadata?.role || "client"),
            lawyerProfile: data.user.user_metadata?.lawyerProfile,
          };
          setUser(u);
          localStorage.setItem("jg_user", JSON.stringify(u));
          return {};
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const existingUsers: (User & { password: string })[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
    const found = existingUsers.find((u) => u.email === email && u.password === password);
    if (!found) return { error: "E-posta veya şifre hatalı." };

    if (!found) {
      return { error: "E-posta veya şifre hatalı." };
    }

    const userWithoutPassword: User = {
      id: found.id, email: found.email, name: found.name,
      role: checkIsAdmin(found.email) ? "admin" : found.role,
      lawyerProfile: found.lawyerProfile, created_at: found.created_at,
    };
    setUser(userWithoutPassword);
    localStorage.setItem("jg_user", JSON.stringify(userWithoutPassword));
    return {};
  }, []);

  const signOut = useCallback(async () => {
    if (hasSupabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem("jg_user");
    setUser(null);
  }, []);

  const updateLawyerProfile = useCallback((profile: LawyerProfile) => {
    if (!user) return;
    const updated = { ...user, lawyerProfile: profile };
    setUser(updated);
    saveUserLocal(updated);

    // Supabase güncelle
    if (hasSupabase) {
      supabase.from("lawyer_profiles").update({
        title: profile.title,
        bar_association: profile.barAssociation,
        city: profile.city,
        specialties: profile.specialties,
        experience: profile.experience,
        phone: profile.phone,
        about: profile.about,
        consultation_fee: profile.consultationFee,
        languages: profile.languages,
      }).eq("id", user.id).then(() => {});
    }

    // localStorage registry
    const users: (User & { password: string })[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], lawyerProfile: profile };
      localStorage.setItem("jg_users", JSON.stringify(users));
    }
    saveLawyerToRegistry(updated);
  }, [user]);

  const isAdmin = checkIsAdmin(user?.email);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut, updateLawyerProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// Avukat kayıt defteri
function saveLawyerToRegistry(user: User) {
  if (!user.lawyerProfile) return;
  const registry: User[] = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  const existingIdx = registry.findIndex((l) => l.id === user.id);
  if (existingIdx >= 0) registry[existingIdx] = user;
  else registry.push(user);
  localStorage.setItem("jg_lawyer_registry", JSON.stringify(registry));
}

export function getRegisteredLawyers(): User[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]"); } catch { return []; }
}

export const useAuth = () => useContext(AuthContext);
