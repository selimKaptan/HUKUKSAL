import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Admin doğrulama API'si
 * Supabase auth token ile kullanıcının gerçekten admin olduğunu doğrular.
 * Admin e-postalar server-side env variable'dan okunur (client'ta hardcode değil).
 */

// Admin e-postaları environment variable'dan okunur
function getAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  const defaults = ["selim@barbarosshipping.com"];
  if (!envAdmins) return defaults;
  return envAdmins.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Authorization header'dan token al
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ isAdmin: false, error: "Token gerekli" }, { status: 401 });
    }

    if (supabaseUrl && supabaseKey) {
      // Supabase ile doğrula
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return NextResponse.json({ isAdmin: false, error: "Geçersiz token" }, { status: 401 });
      }

      const adminEmails = getAdminEmails();
      const isAdmin = adminEmails.includes((user.email || "").toLowerCase());

      return NextResponse.json({ isAdmin, email: user.email });
    }

    // Supabase yoksa localStorage-based auth için basit kontrol
    // Body'den email gönderilir ama bu güvenli değil - sadece demo amaçlı
    const body = await request.json().catch(() => ({}));
    const email = body.email || "";
    const adminEmails = getAdminEmails();

    return NextResponse.json({
      isAdmin: adminEmails.includes(email.toLowerCase()),
      warning: "Server-side auth aktif değil. Supabase bağlantısı önerilir.",
    });
  } catch {
    return NextResponse.json({ isAdmin: false, error: "Doğrulama hatası" }, { status: 500 });
  }
}
