"use client";

/**
 * Sohbet geçmişi yönetimi - localStorage tabanlı
 */

const CHAT_HISTORY_KEY = "hklrm_chat_history";

export interface SavedChat {
  id: string;
  title: string;
  messages: { role: "user" | "assistant"; content: string }[];
  mode: "lawyer" | "incognito" | "emsal";
  createdAt: string;
  updatedAt: string;
}

export function getChatHistory(): SavedChat[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch { return []; }
}

export function saveChat(chat: SavedChat): void {
  const history = getChatHistory();
  const idx = history.findIndex((c) => c.id === chat.id);
  if (idx >= 0) {
    history[idx] = { ...chat, updatedAt: new Date().toISOString() };
  } else {
    history.unshift(chat);
  }
  // Max 50 sohbet tut
  const trimmed = history.slice(0, 50);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
}

export function deleteChat(chatId: string): void {
  const history = getChatHistory().filter((c) => c.id !== chatId);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

export function generateChatTitle(firstMessage: string): string {
  return firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "..." : "");
}
