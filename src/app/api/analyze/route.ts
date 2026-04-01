import { NextRequest, NextResponse } from "next/server";
import { analyzeCase } from "@/lib/analysis-engine";
import { analyzeCaseWithClaude } from "@/lib/claude-analyzer";
import type { CaseCategory } from "@/types/database";
import { cleanFormInput } from "@/lib/sanitize";
import { supabase, hasSupabase } from "@/lib/supabase";

// Admin emails - sınırsız
const ADMIN_EMAILS = ["selim@barbarosshipping.com"];
const FREE_LIMIT = 3;

// Vercel timeout'u artır
export const maxDuration = 60;

// Server-side kullanım limiti kontrolü
async function checkUsageLimit(userId: string, userEmail: string): Promise<{ allowed: boolean; used: number }> {
  // Admin her zaman geçer
  if (ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
    return { allowed: true, used: 0 };
  }

  if (hasSupabase) {
    try {
      const { count, error } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (!error && count !== null) {
        return { allowed: count < FREE_LIMIT, used: count };
      }
    } catch { /* fallback */ }
  }

  // Supabase yoksa izin ver (client-side kontrol devrede)
  return { allowed: true, used: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventSummary, category, additionalNotes, userId, userEmail } = body;

    // Server-side limit kontrolü
    if (userId && userEmail) {
      const limit = await checkUsageLimit(userId, userEmail);
      if (!limit.allowed) {
        return NextResponse.json(
          { error: "Ücretsiz analiz hakkınız dolmuş. Pro plana geçin.", used: limit.used, limit: FREE_LIMIT },
          { status: 429 }
        );
      }
    }

    // Input sanitizasyonu
    const safeEventSummary = cleanFormInput(eventSummary || "", 10000);
    const safeCategory = cleanFormInput(category || "", 50);
    const safeNotes = cleanFormInput(additionalNotes || "", 5000);

    if (!safeEventSummary || !safeCategory) {
      return NextResponse.json(
        { error: "eventSummary and category are required" },
        { status: 400 }
      );
    }

    if (safeEventSummary.length < 20) {
      return NextResponse.json(
        { error: "eventSummary must be at least 20 characters" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const hasClaudeKey = !!apiKey;

    if (hasClaudeKey) {
      try {
        const analysisResult = await analyzeCaseWithClaude(
          safeEventSummary,
          safeCategory as CaseCategory,
          safeNotes
        );

        return NextResponse.json({
          ...analysisResult,
          aiProvider: "claude",
        });
      } catch (error) {
        console.error("Claude API error:", error);

        // Yerel motora düş ama hatayı da gönder
        const analysisResult = analyzeCase(
          safeEventSummary,
          safeCategory as CaseCategory,
          safeNotes
        );

        return NextResponse.json({
          ...analysisResult,
          aiProvider: "local",
        });
      }
    }

    // API key yok
    const analysisResult = analyzeCase(
      eventSummary,
      category as CaseCategory,
      additionalNotes
    );

    return NextResponse.json({
      ...analysisResult,
      aiProvider: "local",
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis" },
      { status: 500 }
    );
  }
}
