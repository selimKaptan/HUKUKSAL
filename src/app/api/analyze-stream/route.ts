import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeCase } from "@/lib/analysis-engine";
import { searchUyapPrecedents, getCategoryKeywords } from "@/lib/uyap-client";
import { checkRateLimit } from "@/lib/rate-limiter";
import { CASE_CATEGORY_LABELS } from "@/types/database";
import { PRECEDENTS_DB } from "@/lib/precedents-data";
import type { CaseCategory } from "@/types/database";
import type { UyapDecision } from "@/lib/uyap-client";

/**
 * Streaming analiz endpoint'i
 * Server-Sent Events (SSE) ile adım adım sonuç gönderir
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: `Çok fazla istek. ${rateCheck.retryAfter}s sonra deneyin.` }),
      { status: 429 }
    );
  }

  const body = await request.json();
  const { eventSummary, category, additionalNotes } = body;

  if (!eventSummary || !category || eventSummary.length < 20) {
    return new Response(JSON.stringify({ error: "Geçersiz giriş" }), { status: 400 });
  }

  const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        // Adım 1: Arama kelimeleri
        send("step", { step: 1, message: "AI arama kelimeleri çıkarılıyor..." });

        let searchKeywords: string[] = [];
        if (hasClaudeKey) {
          try {
            const client = new Anthropic();
            const kwResponse = await client.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 200,
              system: "Sen Türk hukuku uzmanısın. Verilen olay özetinden UYAP emsal karar araması için en etkili 3 arama terimi üret. SADECE JSON array döndür.",
              messages: [{ role: "user", content: `Kategori: ${category}\nOlay: ${eventSummary.substring(0, 500)}` }],
            });
            let text = "";
            for (const block of kwResponse.content) {
              if (block.type === "text") text += block.text;
            }
            text = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
            searchKeywords = JSON.parse(text).filter((k: string) => typeof k === "string" && k.length > 1);
          } catch { /* fallback */ }
        }
        if (searchKeywords.length === 0) {
          const categoryKw = getCategoryKeywords(category);
          const summaryWords = eventSummary.split(/\s+/).filter((w: string) => w.length > 3).slice(0, 3).join(" ");
          searchKeywords = [summaryWords || categoryKw[0] || "dava"];
        }
        send("keywords", { keywords: searchKeywords });

        // Adım 2: UYAP arama
        send("step", { step: 2, message: "UYAP emsal kararları aranıyor..." });
        let uyapDecisions: UyapDecision[] = [];
        let uyapAvailable = false;
        let uyapError: string | null = null;
        let uyapTotalCount = 0;

        for (const keyword of searchKeywords) {
          try {
            const uyapResults = await searchUyapPrecedents({ aranacakKelime: keyword, pageSize: 5, pageNumber: 1 });
            if (uyapResults.success && uyapResults.decisions.length > 0) {
              const existingIds = new Set(uyapDecisions.map((d) => d.esas_no || d.karar_id));
              const newDecisions = uyapResults.decisions.filter((d) => !existingIds.has(d.esas_no || d.karar_id));
              uyapDecisions.push(...newDecisions);
              uyapAvailable = true;
              uyapTotalCount += uyapResults.totalCount;
            } else if (!uyapAvailable && uyapResults.error) {
              uyapError = uyapResults.error;
            }
          } catch { /* continue */ }
        }
        uyapDecisions = uyapDecisions.slice(0, 10);
        send("uyap", { count: uyapDecisions.length, available: uyapAvailable, totalCount: uyapTotalCount });

        // Adım 3: AI analiz
        send("step", { step: 3, message: hasClaudeKey ? "Claude AI analiz yapıyor..." : "Yerel AI analiz yapıyor..." });

        let analysisResult;
        if (hasClaudeKey) {
          try {
            // Streaming Claude analiz
            const client = new Anthropic();
            const localPrecedents = PRECEDENTS_DB.filter((p) => p.category === category).slice(0, 5);
            const categoryLabel = CASE_CATEGORY_LABELS[category as CaseCategory];

            let precedentContext = "## EMSAL KARAR VERİTABANI\n\n";
            localPrecedents.forEach((p, i) => {
              precedentContext += `### [İndeks ${i}] ${p.court} - ${p.case_number}\nÖzet: ${p.summary}\nKarar: ${p.ruling}\nSonuç: ${p.outcome === "plaintiff_won" ? "Davacı Kazandı" : "Davalı Kazandı"}\n\n`;
            });
            if (uyapDecisions.length > 0) {
              precedentContext += "\n## UYAP EMSAL KARARLARI\n\n";
              uyapDecisions.forEach((d, i) => {
                const idx = localPrecedents.length + i;
                precedentContext += `### [İndeks ${idx}] ${d.mahkeme}\nEsas: ${d.esas_no}\n${d.ozet ? `Özet: ${d.ozet.substring(0, 300)}` : ""}\n\n`;
              });
            }

            const systemPrompt = `Sen JusticeGuard AI'sın — Türk hukuk sistemi uzmanı. Olay analizi yap ve JSON döndür.
ÇIKTI: {"winProbability":number(15-92),"strengths":string[],"weaknesses":string[],"recommendation":"file_case"|"do_not_file"|"needs_review","analysisReport":string,"riskFactors":string[],"suggestedActions":string[],"selectedPrecedentIndices":number[],"precedentScores":number[]}`;

            const aiResponse = await client.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 4096,
              system: systemPrompt,
              messages: [{
                role: "user",
                content: `Kategori: ${categoryLabel}\nOlay: ${eventSummary}\n${additionalNotes ? `Ek: ${additionalNotes}` : ""}\n\n${precedentContext}\n\nSADECE JSON döndür.`,
              }],
            });

            let jsonText = "";
            for (const block of aiResponse.content) {
              if (block.type === "text") jsonText += block.text;
            }
            jsonText = jsonText.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

            let analysis;
            try {
              analysis = JSON.parse(jsonText);
            } catch {
              try {
                analysis = JSON.parse(jsonText.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"));
              } catch {
                analysis = {
                  winProbability: 50, strengths: ["Analiz tamamlandı."], weaknesses: ["Detaylar ayrıştırılamadı."],
                  recommendation: "needs_review", analysisReport: "", riskFactors: [], suggestedActions: ["Avukata danışın."],
                  selectedPrecedentIndices: [], precedentScores: [],
                };
              }
            }

            // Emsalleri eşleştir
            const selectedIndices: number[] = analysis.selectedPrecedentIndices || [];
            const precedentScores: number[] = analysis.precedentScores || [];
            const matchedPrecedents = selectedIndices.map((idx: number, i: number) => {
              if (idx < localPrecedents.length) {
                const p = localPrecedents[idx];
                return { ...p, id: `local_${idx}`, created_at: new Date().toISOString(), relevance_score: precedentScores[i] ?? 0.5 };
              } else {
                const uyapIdx = idx - localPrecedents.length;
                if (uyapIdx < uyapDecisions.length) {
                  const d = uyapDecisions[uyapIdx];
                  return {
                    id: `uyap_${idx}`, case_number: d.esas_no || d.karar_no, court: d.mahkeme,
                    date: d.karar_tarihi, summary: d.ozet || "", ruling: d.karar_no || "",
                    outcome: "plaintiff_won" as const, category: category as CaseCategory,
                    keywords: [] as string[], created_at: new Date().toISOString(), relevance_score: precedentScores[i] ?? 0.5,
                  };
                }
                return null;
              }
            }).filter(Boolean);

            if (matchedPrecedents.length === 0) {
              localPrecedents.slice(0, 3).forEach((p, i) => {
                matchedPrecedents.push({ ...p, id: `local_${i}`, created_at: new Date().toISOString(), relevance_score: 0.8 - i * 0.15 });
              });
            }

            analysisResult = {
              winProbability: Math.max(15, Math.min(92, analysis.winProbability || 50)),
              strengths: analysis.strengths || [],
              weaknesses: analysis.weaknesses || [],
              recommendation: analysis.recommendation || "needs_review",
              analysisReport: analysis.analysisReport || "",
              matchedPrecedents,
              riskFactors: analysis.riskFactors || [],
              suggestedActions: analysis.suggestedActions || [],
            };
          } catch (error) {
            console.error("Claude streaming error:", error);
            analysisResult = analyzeCase(eventSummary, category as CaseCategory, additionalNotes);
          }
        } else {
          analysisResult = analyzeCase(eventSummary, category as CaseCategory, additionalNotes);
        }

        // Adım 4: Sonuç
        send("step", { step: 4, message: "Rapor hazırlanıyor..." });

        const finalResult = {
          ...analysisResult,
          uyapPrecedents: uyapDecisions,
          uyapAvailable,
          uyapError,
          uyapTotalCount,
          aiProvider: hasClaudeKey ? "claude" : "local",
          searchKeywords: hasClaudeKey ? searchKeywords : undefined,
        };

        send("result", finalResult);
        send("done", { success: true });
      } catch (error) {
        send("error", { message: error instanceof Error ? error.message : "Bilinmeyen hata" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
