import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * GET - Kullanıcının abonelik durumunu getir
 * POST - Abonelik oluştur/güncelle
 */

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ plan: "free" });
    }

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (data) {
        // Süre dolmuş mu kontrol et
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          await supabase
            .from("subscriptions")
            .update({ status: "expired", plan: "free" })
            .eq("id", data.id);
          return NextResponse.json({ plan: "free", expired: true });
        }
        return NextResponse.json({
          plan: data.plan,
          period: data.period,
          expiresAt: data.expires_at,
          status: data.status,
        });
      }
    }

    // localStorage fallback
    return NextResponse.json({ plan: "free" });
  } catch {
    return NextResponse.json({ plan: "free" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, period } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: "userId ve plan gerekli" }, { status: 400 });
    }

    // Abonelik bitiş tarihi hesapla
    const now = new Date();
    const expiresAt = new Date(now);
    if (period === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Upsert - varsa güncelle, yoksa oluştur
      const { data, error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan,
            period: period || "monthly",
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            status: "active",
            payment_provider: "app_store",
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) {
        console.error("Subscription error:", error);
        return NextResponse.json({ error: "Abonelik kaydedilemedi" }, { status: 500 });
      }

      return NextResponse.json({ success: true, subscription: data });
    }

    // Supabase yoksa localStorage'a kaydet talimatı
    return NextResponse.json({
      success: true,
      plan,
      period,
      expiresAt: expiresAt.toISOString(),
      note: "localStorage'a kaydedildi",
    });
  } catch {
    return NextResponse.json({ error: "Abonelik hatası" }, { status: 500 });
  }
}
