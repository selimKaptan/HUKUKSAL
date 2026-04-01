"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, hasSupabase } from "./supabase";
import type { CaseCategory } from "@/types/database";

export type UserRole = "client" | "lawyer";

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
  signUp: (email: string, password: string, name: string, role: UserRole, lawyerProfile?: LawyerProfile) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateLawyerProfile: (profile: LawyerProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  updateLawyerProfile: () => {},
});

function saveUserLocal(u: User | null) {
  if (u) localStorage.setItem("jg_user", JSON.stringify(u));
  else localStorage.removeItem("jg_user");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Init: check session
  useEffect(() => {
    // 1. LocalStorage'dan hızlı yükle (flash önleme)
    const stored = localStorage.getItem("jg_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* */ }
    }

    // 2. Supabase session kontrol
    if (hasSupabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
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
        }
        setLoading(false);
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (!error && data.user) {
        const u: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name,
          role: data.user.user_metadata?.role || "client",
          lawyerProfile: data.user.user_metadata?.lawyerProfile,
        };
        setUser(u);
        saveUserLocal(u);
        return {};
      }
      // Supabase'de bulunamadıysa localStorage'a bak
    }

    // localStorage fallback
    const existingUsers: (User & { password: string })[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
    const found = existingUsers.find((u) => u.email === email && u.password === password);
    if (!found) return { error: "E-posta veya şifre hatalı." };

    const u: User = { id: found.id, email: found.email, name: found.name, role: found.role, lawyerProfile: found.lawyerProfile, created_at: found.created_at };
    setUser(u);
    saveUserLocal(u);
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

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateLawyerProfile }}>
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
