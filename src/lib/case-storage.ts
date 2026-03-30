"use client";

import type { AnalysisResult, CaseCategory } from "@/types/database";

export interface SavedCase {
  id: string;
  userId: string;
  title: string;
  category: CaseCategory;
  eventSummary: string;
  result: AnalysisResult;
  createdAt: string;
  aiProvider: "claude" | "local";
}

const STORAGE_KEY = "jg_cases";

export function saveCaseResult(
  userId: string,
  title: string,
  category: CaseCategory,
  eventSummary: string,
  result: AnalysisResult,
  aiProvider: "claude" | "local"
): SavedCase {
  const cases = getCasesByUser(userId);
  const newCase: SavedCase = {
    id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    title,
    category,
    eventSummary,
    result,
    createdAt: new Date().toISOString(),
    aiProvider,
  };
  cases.unshift(newCase);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getAllCases().concat([newCase]).reduce((acc, c) => {
    if (!acc.find((x: SavedCase) => x.id === c.id)) acc.push(c);
    return acc;
  }, [] as SavedCase[])));
  return newCase;
}

function getAllCases(): SavedCase[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getCasesByUser(userId: string): SavedCase[] {
  return getAllCases()
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getCaseById(caseId: string): SavedCase | null {
  return getAllCases().find((c) => c.id === caseId) || null;
}

export function deleteCaseById(caseId: string): void {
  const cases = getAllCases().filter((c) => c.id !== caseId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}
