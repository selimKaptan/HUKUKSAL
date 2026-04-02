"use client";

/**
 * Milestone sistemi - kullanıcı aktivitelerine göre başarı bildirimleri
 */

const MILESTONE_KEY = "hklrm_milestones";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  emoji: string;
  threshold: number;
  metric: "questions" | "days" | "shares" | "tools";
}

export const MILESTONES: Milestone[] = [
  { id: "first_question", title: "İlk Adım", description: "İlk sorunuzu sordunuz!", emoji: "🎉", threshold: 1, metric: "questions" },
  { id: "3_questions", title: "Meraklı", description: "3 soru sordunuz, haklarınızı öğreniyorsunuz!", emoji: "📚", threshold: 3, metric: "questions" },
  { id: "10_questions", title: "Hukuk Meraklısı", description: "10 soru! Artık haklarınızı biliyorsunuz.", emoji: "⚖️", threshold: 10, metric: "questions" },
  { id: "3_days", title: "Düzenli", description: "3 gün üst üste giriş yaptınız!", emoji: "🔥", threshold: 3, metric: "days" },
  { id: "7_days", title: "Sadık Kullanıcı", description: "7 günlük seri! Tebrikler.", emoji: "⭐", threshold: 7, metric: "days" },
  { id: "first_share", title: "Paylaşımcı", description: "İlk paylaşımınız! Arkadaşlarınız da öğrensin.", emoji: "🤝", threshold: 1, metric: "shares" },
  { id: "first_tool", title: "Araç Ustası", description: "İlk aracı kullandınız!", emoji: "🛠️", threshold: 1, metric: "tools" },
];

interface MilestoneData {
  achieved: string[];
  questions: number;
  shares: number;
  tools: number;
}

function getData(): MilestoneData {
  if (typeof window === "undefined") return { achieved: [], questions: 0, shares: 0, tools: 0 };
  try {
    return JSON.parse(localStorage.getItem(MILESTONE_KEY) || '{"achieved":[],"questions":0,"shares":0,"tools":0}');
  } catch { return { achieved: [], questions: 0, shares: 0, tools: 0 }; }
}

function saveData(data: MilestoneData) {
  localStorage.setItem(MILESTONE_KEY, JSON.stringify(data));
}

export function trackMilestone(metric: "questions" | "shares" | "tools", streak?: number): Milestone | null {
  const data = getData();
  data[metric] += 1;

  // Streak milestones
  const checkValue = metric === "questions" ? data.questions : metric === "shares" ? data.shares : data.tools;

  let newMilestone: Milestone | null = null;
  for (const ms of MILESTONES) {
    if (ms.metric === metric && checkValue >= ms.threshold && !data.achieved.includes(ms.id)) {
      data.achieved.push(ms.id);
      newMilestone = ms;
    }
    // Day streaks
    if (ms.metric === "days" && streak && streak >= ms.threshold && !data.achieved.includes(ms.id)) {
      data.achieved.push(ms.id);
      newMilestone = ms;
    }
  }

  saveData(data);
  return newMilestone;
}
