import { NextRequest, NextResponse } from "next/server";
import { analyzeCase } from "@/lib/analysis-engine";
import { searchUyapPrecedents, getCategoryKeywords } from "@/lib/uyap-client";
import type { CaseCategory } from "@/types/database";

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

    // 1. Yerel analiz motorunu çalıştır
    const localResult = analyzeCase(
      eventSummary,
      category as CaseCategory,
      additionalNotes
    );

    // 2. UYAP'tan gerçek emsal kararları ara (paralel)
    let uyapResults = null;
    try {
      // Olay özetinden anahtar kelimeleri çıkar
      const categoryKeywords = getCategoryKeywords(category);
      const summaryWords = eventSummary
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 3)
        .join(" ");
      const searchKeyword = summaryWords || categoryKeywords[0] || "dava";

      uyapResults = await searchUyapPrecedents({
        aranacakKelime: searchKeyword,
        pageSize: 5,
        pageNumber: 1,
      });
    } catch {
      // UYAP erişilemezse yerel sonuçlarla devam et
      console.log("UYAP erişilemedi, yerel sonuçlar kullanılıyor.");
    }

    // 3. Sonuçları birleştir
    const response = {
      ...localResult,
      uyapPrecedents: uyapResults?.success ? uyapResults.decisions : [],
      uyapAvailable: uyapResults?.success || false,
      uyapError: uyapResults?.error || null,
      uyapTotalCount: uyapResults?.totalCount || 0,
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
