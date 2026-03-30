import { NextRequest, NextResponse } from "next/server";
import { analyzeCase } from "@/lib/analysis-engine";
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

    // Simulate processing delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = analyzeCase(
      eventSummary,
      category as CaseCategory,
      additionalNotes
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis" },
      { status: 500 }
    );
  }
}
