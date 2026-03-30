"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const stored = localStorage.getItem("jg_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("jg_user");
      }
    }

    // Try Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name,
        };
        setUser(u);
        localStorage.setItem("jg_user", JSON.stringify(u));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name,
        };
        setUser(u);
        localStorage.setItem("jg_user", JSON.stringify(u));
      } else {
        // Only clear if no local user
        const stored = localStorage.getItem("jg_user");
        if (!stored) {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    // Try Supabase first
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (!error && data.user) {
      const u: User = { id: data.user.id, email, name, created_at: new Date().toISOString() };
      setUser(u);
      localStorage.setItem("jg_user", JSON.stringify(u));
      return {};
    }

    // Fallback: localStorage-based auth (demo mode)
    const existingUsers = JSON.parse(localStorage.getItem("jg_users") || "[]");
    if (existingUsers.find((u: User) => u.email === email)) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }

    const newUser: User = {
      id: `local_${Date.now()}`,
      email,
      name,
      created_at: new Date().toISOString(),
    };
    existingUsers.push({ ...newUser, password });
    localStorage.setItem("jg_users", JSON.stringify(existingUsers));
    localStorage.setItem("jg_user", JSON.stringify(newUser));
    setUser(newUser);
    return {};
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Try Supabase first
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data.user) {
      const u: User = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name,
      };
      setUser(u);
      localStorage.setItem("jg_user", JSON.stringify(u));
      return {};
    }

    // Fallback: localStorage-based auth
    const existingUsers = JSON.parse(localStorage.getItem("jg_users") || "[]");
    const found = existingUsers.find(
      (u: User & { password: string }) => u.email === email && u.password === password
    );

    if (!found) {
      return { error: "E-posta veya şifre hatalı." };
    }

    const userWithoutPassword = { id: found.id, email: found.email, name: found.name, created_at: found.created_at };
    setUser(userWithoutPassword);
    localStorage.setItem("jg_user", JSON.stringify(userWithoutPassword));
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("jg_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
