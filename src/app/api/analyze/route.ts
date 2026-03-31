import { NextRequest, NextResponse } from "next/server";
import { analyzeCase } from "@/lib/analysis-engine";
import { analyzeCaseWithClaude } from "@/lib/claude-analyzer";
import type { CaseCategory } from "@/types/database";

// Vercel timeout'u artır
export const maxDuration = 60;

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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const hasClaudeKey = !!apiKey;

    if (hasClaudeKey) {
      try {
        const analysisResult = await analyzeCaseWithClaude(
          eventSummary,
          category as CaseCategory,
          additionalNotes
        );

        return NextResponse.json({
          ...analysisResult,
          aiProvider: "claude",
        });
      } catch (error) {
        console.error("Claude API error:", error);

        // Yerel motora düş ama hatayı da gönder
        const analysisResult = analyzeCase(
          eventSummary,
          category as CaseCategory,
          additionalNotes
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
