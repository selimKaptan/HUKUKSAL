import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeCase } from "@/lib/analysis-engine";
import { analyzeCaseWithClaude } from "@/lib/claude-analyzer";
import { searchUyapPrecedents, getCategoryKeywords } from "@/lib/uyap-client";
import { apiSecurityCheck, safeErrorResponse } from "@/lib/api-security";
import { validateAnalysisInput, sanitizeForPrompt } from "@/lib/sanitize";
import type { CaseCategory } from "@/types/database";
import type { UyapDecision } from "@/lib/uyap-client";

/**
 * AI ile olay özetinden en uygun UYAP arama kelimelerini çıkarır.
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

/**
 * AI ile UYAP sonuçlarını filtreleyip en alakalı olanları seç.
 */
async function filterUyapWithAI(
  decisions: UyapDecision[],
  eventSummary: string,
  category: string
): Promise<UyapDecision[]> {
  if (decisions.length <= 3) return decisions;
  try {
    const client = new Anthropic();
    const summaries = decisions.map((d, i) =>
      `[${i}] ${d.mahkeme} | ${d.esas_no} | ${(d.ozet || d.metin || "").substring(0, 200)}`
    ).join("\n");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: "Verilen UYAP emsal kararları arasından olaya en uygun olanların indeks numaralarını seç. SADECE JSON array döndür. Örnek: [0, 2, 5]",
      messages: [{
        role: "user",
        content: `Olay: ${eventSummary.substring(0, 300)}\nKategori: ${category}\n\nKararlar:\n${summaries}`,
      }],
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") text += block.text;
    }
    text = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const indices: number[] = JSON.parse(text);
    const filtered = indices
      .filter((i) => i >= 0 && i < decisions.length)
      .map((i) => decisions[i]);
    return filtered.length > 0 ? filtered : decisions.slice(0, 5);
  } catch {
    return decisions.slice(0, 5);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Güvenlik kontrolü (CSRF + Rate Limit)
    const securityError = apiSecurityCheck(request, "/api/analyze");
    if (securityError) return securityError;

    const body = await request.json();

    // Input doğrulama
    const validation = validateAnalysisInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Prompt injection koruması
    const eventSummary = sanitizeForPrompt(body.eventSummary);
    const category = body.category;
    const additionalNotes = body.additionalNotes ? sanitizeForPrompt(body.additionalNotes) : undefined;

    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;

    // 1. AI ile akıllı arama kelimeleri çıkar
    let searchKeywords: string[] = [];
    if (hasClaudeKey) {
      searchKeywords = await extractSearchKeywordsWithAI(eventSummary, category);
    }

    if (searchKeywords.length === 0) {
      const categoryKeywords = getCategoryKeywords(category);
      const summaryWords = eventSummary
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 3)
        .join(" ");
      searchKeywords = [summaryWords || categoryKeywords[0] || "dava"];
    }

    // 2. UYAP'tan gerçek emsal kararları ara
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
          const existingIds = new Set(uyapDecisions.map((d) => d.esas_no || d.karar_id));
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
        // UYAP araması başarısız, devam et
      }
    }

    uyapDecisions = uyapDecisions.slice(0, 10);

    if (hasClaudeKey && uyapDecisions.length > 3) {
      uyapDecisions = await filterUyapWithAI(uyapDecisions, eventSummary, category);
    }

    // 3. Claude AI ile analiz
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
        analysisResult = analyzeCase(eventSummary, category as CaseCategory, additionalNotes);
      }
    } else {
      analysisResult = analyzeCase(eventSummary, category as CaseCategory, additionalNotes);
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
    return safeErrorResponse(error, "Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
  }
}
