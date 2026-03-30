import { NextRequest, NextResponse } from "next/server";
import { analyzeCase } from "@/lib/analysis-engine";
import { analyzeCaseWithClaude } from "@/lib/claude-analyzer";
import { searchUyapPrecedents, getCategoryKeywords } from "@/lib/uyap-client";
import type { CaseCategory } from "@/types/database";
import type { UyapDecision } from "@/lib/uyap-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventSummary, category, additionalNotes } = body;

    if (!eventSummary || !category) {
      return NextResponse.json(
        { error: "eventSummary and category are required" },
        { status: 400 }
      );
    }

    if (eventSummary.length < 20) {
      return NextResponse.json(
        { error: "eventSummary must be at least 20 characters" },
        { status: 400 }
      );
    }

    // 1. UYAP'tan gerçek emsal kararları ara
    let uyapDecisions: UyapDecision[] = [];
    let uyapAvailable = false;
    let uyapError: string | null = null;
    let uyapTotalCount = 0;

    try {
      const categoryKeywords = getCategoryKeywords(category);
      const summaryWords = eventSummary
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 3)
        .join(" ");
      const searchKeyword = summaryWords || categoryKeywords[0] || "dava";

      const uyapResults = await searchUyapPrecedents({
        aranacakKelime: searchKeyword,
        pageSize: 5,
        pageNumber: 1,
      });

      if (uyapResults.success) {
        uyapDecisions = uyapResults.decisions;
        uyapAvailable = true;
        uyapTotalCount = uyapResults.totalCount;
      } else {
        uyapError = uyapResults.error || null;
      }
    } catch {
      console.log("UYAP erişilemedi, devam ediliyor.");
    }

    // 2. Claude AI ile analiz (API key varsa)
    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
    let analysisResult;

    if (hasClaudeKey) {
      try {
        analysisResult = await analyzeCaseWithClaude(
          eventSummary,
          category as CaseCategory,
          additionalNotes,
          uyapDecisions.length > 0 ? uyapDecisions : undefined
        );
      } catch (error) {
        console.error("Claude API error, falling back to local:", error);
        // Fallback: yerel analiz motoru
        analysisResult = analyzeCase(
          eventSummary,
          category as CaseCategory,
          additionalNotes
        );
      }
    } else {
      // Claude API key yoksa yerel analiz motorunu kullan
      analysisResult = analyzeCase(
        eventSummary,
        category as CaseCategory,
        additionalNotes
      );
    }

    // 3. Sonuçları birleştir
    const response = {
      ...analysisResult,
      uyapPrecedents: uyapDecisions,
      uyapAvailable,
      uyapError,
      uyapTotalCount,
      aiProvider: hasClaudeKey ? "claude" : "local",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis" },
      { status: 500 }
    );
  }
}
