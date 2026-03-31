"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  useEffect(() => {
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
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, role: UserRole, lawyerProfile?: LawyerProfile) => {
    if (hasSupabase) {
      try {
        const { supabase } = await import("./supabase");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role, lawyerProfile } },
        });
        if (!error && data.user) {
          const u: User = { id: data.user.id, email, name, role, lawyerProfile, created_at: new Date().toISOString() };
          setUser(u);
          localStorage.setItem("jg_user", JSON.stringify(u));
          // Avukatsa listeye ekle
          if (role === "lawyer" && lawyerProfile) {
            saveLawyerToRegistry(u);
          }
          return {};
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const existingUsers: (User & { password: string })[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
    if (existingUsers.find((u) => u.email === email)) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }

    const newUser: User = {
      id: `local_${Date.now()}`,
      email,
      name,
      role,
      lawyerProfile,
      created_at: new Date().toISOString(),
    };
    existingUsers.push({ ...newUser, password });
    localStorage.setItem("jg_users", JSON.stringify(existingUsers));
    localStorage.setItem("jg_user", JSON.stringify(newUser));
    setUser(newUser);

    if (role === "lawyer" && lawyerProfile) {
      saveLawyerToRegistry(newUser);
    }

    return {};
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
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

    const existingUsers: (User & { password: string })[] = JSON.parse(localStorage.getItem("jg_users") || "[]");
    const found = existingUsers.find((u) => u.email === email && u.password === password);

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
      try {
        const { supabase } = await import("./supabase");
        await supabase.auth.signOut();
      } catch { /* ignore */ }
    }
    localStorage.removeItem("jg_user");
    setUser(null);
  }, []);

  const updateLawyerProfile = useCallback((profile: LawyerProfile) => {
    if (!user) return;
    const updated = { ...user, lawyerProfile: profile };
    setUser(updated);
    localStorage.setItem("jg_user", JSON.stringify(updated));

    // Update users list
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

// Avukat kayıt defteri - tüm kayıtlı avukatlar
function saveLawyerToRegistry(user: User) {
  if (!user.lawyerProfile) return;
  const registry: User[] = JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  const existingIdx = registry.findIndex((l) => l.id === user.id);
  if (existingIdx >= 0) {
    registry[existingIdx] = user;
  } else {
    registry.push(user);
  }
  localStorage.setItem("jg_lawyer_registry", JSON.stringify(registry));
}

export function getRegisteredLawyers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("jg_lawyer_registry") || "[]");
  } catch {
    return [];
  }
}

export const useAuth = () => useContext(AuthContext);
