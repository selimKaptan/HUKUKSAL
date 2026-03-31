/**
 * Google OAuth Altyapısı
 * Supabase Auth üzerinden Google ile giriş
 *
 * Aktifleştirme:
 * 1. Supabase Dashboard → Authentication → Providers → Google
 * 2. Google Cloud Console → OAuth 2.0 Client ID oluştur
 * 3. Client ID ve Secret'ı Supabase'e ekle
 */

export async function signInWithGoogle(): Promise<{ error?: string }> {
  try {
    const { supabase } = await import("./supabase");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
    return {};
  } catch {
    return { error: "Google ile giriş yapılamadı. Lütfen tekrar deneyin." };
  }
}
