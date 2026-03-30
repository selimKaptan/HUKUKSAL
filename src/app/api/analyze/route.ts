import { NextRequest, NextResponse } from "next/server";
import { analyzeCase } from "@/lib/analysis-engine";
import { analyzeCaseWithClaude } from "@/lib/claude-analyzer";
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

    // Claude API ile analiz (API key varsa)
    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
    let analysisResult;

    if (hasClaudeKey) {
      try {
        analysisResult = await analyzeCaseWithClaude(
          eventSummary,
          category as CaseCategory,
          additionalNotes
        );

        return NextResponse.json({
          ...analysisResult,
          aiProvider: "claude",
        });
      } catch (error) {
        console.error("Claude API error, falling back to local:", error);
      }
    }

    // Fallback: yerel analiz motoru
    analysisResult = analyzeCase(
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
