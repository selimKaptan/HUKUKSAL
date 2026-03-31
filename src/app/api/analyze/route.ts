import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeCase } from "@/lib/analysis-engine";
import { analyzeCaseWithClaude } from "@/lib/claude-analyzer";
import { searchUyapPrecedents, getCategoryKeywords } from "@/lib/uyap-client";
import type { CaseCategory } from "@/types/database";
import type { UyapDecision } from "@/lib/uyap-client";

/**
 * AI ile olay özetinden en uygun UYAP arama kelimelerini çıkarır.
 * Basit kelime bölme yerine Claude AI kullanarak hukuki terimlerle arama yapar.
 */
async function extractSearchKeywordsWithAI(
  eventSummary: string,
  category: string
): Promise<string[]> {
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system:
        "Sen Türk hukuku uzmanısın. Verilen olay özetinden UYAP emsal karar araması için en etkili 3 arama terimi üret. Her terim 2-4 kelimeden oluşmalı ve hukuki terim içermeli. SADECE JSON array döndür, başka bir şey yazma. Örnek: [\"kıdem tazminatı\", \"haklı fesih\", \"işe iade\"]",
      messages: [
        {
          role: "user",
          content: `Kategori: ${category}\nOlay: ${eventSummary.substring(0, 500)}`,
        },
      ],
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") text += block.text;
    }
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const keywords: string[] = JSON.parse(text);
    return keywords.filter(
      (k: string) => typeof k === "string" && k.length > 1
    );
  } catch (error) {
    console.error("AI keyword extraction failed:", error);
    return [];
  }
}

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

    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;

    // 1. AI ile akıllı arama kelimeleri çıkar (API key varsa)
    let searchKeywords: string[] = [];
    if (hasClaudeKey) {
      searchKeywords = await extractSearchKeywordsWithAI(
        eventSummary,
        category
      );
    }

    // Fallback: AI çalışmazsa basit kelime çıkarma
    if (searchKeywords.length === 0) {
      const categoryKeywords = getCategoryKeywords(category);
      const summaryWords = eventSummary
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 3)
        .join(" ");
      searchKeywords = [summaryWords || categoryKeywords[0] || "dava"];
    }

    // 2. UYAP'tan gerçek emsal kararları ara - tüm AI anahtar kelimeleriyle
    let uyapDecisions: UyapDecision[] = [];
    let uyapAvailable = false;
    let uyapError: string | null = null;
    let uyapTotalCount = 0;

    for (const keyword of searchKeywords) {
      try {
        const uyapResults = await searchUyapPrecedents({
          aranacakKelime: keyword,
          pageSize: 5,
          pageNumber: 1,
        });

        if (uyapResults.success && uyapResults.decisions.length > 0) {
          // Tekrar eden kararları filtrele
          const existingIds = new Set(
            uyapDecisions.map((d) => d.esas_no || d.karar_id)
          );
          const newDecisions = uyapResults.decisions.filter(
            (d) => !existingIds.has(d.esas_no || d.karar_id)
          );
          uyapDecisions.push(...newDecisions);
          uyapAvailable = true;
          uyapTotalCount += uyapResults.totalCount;
        } else if (!uyapAvailable && uyapResults.error) {
          uyapError = uyapResults.error;
        }
      } catch {
        console.log(`UYAP araması başarısız (kelime: ${keyword}), devam ediliyor.`);
      }
    }

    // En fazla 10 sonuç tut
    uyapDecisions = uyapDecisions.slice(0, 10);

    // 3. Claude AI ile analiz (API key varsa)
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
        analysisResult = analyzeCase(
          eventSummary,
          category as CaseCategory,
          additionalNotes
        );
      }
    } else {
      analysisResult = analyzeCase(
        eventSummary,
        category as CaseCategory,
        additionalNotes
      );
    }

    // 4. Sonuçları birleştir
    const response = {
      ...analysisResult,
      uyapPrecedents: uyapDecisions,
      uyapAvailable,
      uyapError,
      uyapTotalCount,
      aiProvider: hasClaudeKey ? "claude" : "local",
      searchKeywords: hasClaudeKey ? searchKeywords : undefined,
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
