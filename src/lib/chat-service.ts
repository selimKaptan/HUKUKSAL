"use client";

import { supabase } from "./supabase";

const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// =============================================
// Types
// =============================================

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "lawyer" | "admin";
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  caseTitle?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
}

// =============================================
// localStorage Fallback (mevcut davranış)
// =============================================

const CONVERSATIONS_KEY = "jg_conversations";
const MESSAGES_KEY = "jg_messages";

function getStoredConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveConversationsLocal(conversations: Conversation[]) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

function getStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveMessagesLocal(messages: ChatMessage[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

// =============================================
// Supabase Helpers
// =============================================

async function fetchProfileName(userId: string): Promise<string> {
  if (!hasSupabase) return "Kullanıcı";
  try {
    const { data } = await db
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    return data?.name || "Kullanıcı";
  } catch {
    return "Kullanıcı";
  }
}

// =============================================
// Conversation Operations
// =============================================

export async function createConversation(
  clientId: string,
  clientName: string,
  lawyerId: string,
  lawyerName: string,
  caseTitle?: string
): Promise<Conversation> {
  if (hasSupabase) {
    try {
      // Mevcut konuşma var mı kontrol et
      const { data: existing } = await db
        .from("conversations")
        .select("*")
        .eq("client_id", clientId)
        .eq("lawyer_id", lawyerId)
        .single();

      if (existing) {
        return mapConversationFromDB(existing, clientName, lawyerName, 0);
      }

      // Yeni konuşma oluştur
      const { data: row, error } = await db
        .from("conversations")
        .insert({
          client_id: clientId,
          lawyer_id: lawyerId,
          case_title: caseTitle || null,
        })
        .select()
        .single();

      if (!error && row) {
        return mapConversationFromDB(row, clientName, lawyerName, 0);
      }
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const conversations = getStoredConversations();
  const existing = conversations.find(
    (c) => c.clientId === clientId && c.lawyerId === lawyerId
  );
  if (existing) return existing;

  const conversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    clientId,
    clientName,
    lawyerId,
    lawyerName,
    caseTitle,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
  };

  conversations.push(conversation);
  saveConversationsLocal(conversations);
  return conversation;
}

export async function getConversationsByUser(userId: string): Promise<Conversation[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await db
        .from("conversations")
        .select(`
          *,
          client:profiles!conversations_client_id_fkey(name),
          lawyer:profiles!conversations_lawyer_id_fkey(name)
        `)
        .or(`client_id.eq.${userId},lawyer_id.eq.${userId}`)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        const results: Conversation[] = [];
        for (const row of data) {
          // Okunmamış mesaj sayısını hesapla
          const { count } = await db
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", row.id)
            .neq("sender_id", userId)
            .eq("read", false);

          results.push(mapConversationFromDB(
            row,
            row.client?.name || "Müvekkil",
            row.lawyer?.name || "Avukat",
            count || 0
          ));
        }
        return results;
      }
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const conversations = getStoredConversations();
  return conversations
    .filter((c) => c.clientId === userId || c.lawyerId === userId)
    .sort((a, b) => {
      const timeA = a.lastMessageTime || a.createdAt;
      const timeB = b.lastMessageTime || b.createdAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
}

// =============================================
// Message Operations
// =============================================

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await db
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(name, role)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data.map((row: Record<string, unknown>) => {
          const sender = row.sender as Record<string, string> | null;
          return {
            id: row.id as string,
            conversationId: row.conversation_id as string,
            senderId: row.sender_id as string,
            senderName: sender?.name || "Kullanıcı",
            senderRole: (sender?.role || "client") as "client" | "lawyer" | "admin",
            content: row.content as string,
            timestamp: row.created_at as string,
            read: row.read as boolean,
          };
        });
      }
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const messages = getStoredMessages();
  return messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: "client" | "lawyer" | "admin",
  content: string
): Promise<ChatMessage> {
  if (hasSupabase) {
    try {
      const { data: row, error } = await db
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
        })
        .select()
        .single();

      if (!error && row) {
        return {
          id: row.id,
          conversationId: row.conversation_id,
          senderId: row.sender_id,
          senderName,
          senderRole,
          content: row.content,
          timestamp: row.created_at,
          read: false,
        };
      }
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const messages = getStoredMessages();
  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    conversationId,
    senderId,
    senderName,
    senderRole,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  messages.push(message);
  saveMessagesLocal(messages);

  // Update conversation
  const conversations = getStoredConversations();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);
  if (convIndex >= 0) {
    conversations[convIndex].lastMessage = content;
    conversations[convIndex].lastMessageTime = message.timestamp;
    conversations[convIndex].unreadCount += 1;
    saveConversationsLocal(conversations);
  }

  return message;
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  if (hasSupabase) {
    try {
      await db
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("read", false);
      return;
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const messages = getStoredMessages();
  let changed = false;

  for (const msg of messages) {
    if (msg.conversationId === conversationId && msg.senderId !== userId && !msg.read) {
      msg.read = true;
      changed = true;
    }
  }

  if (changed) {
    saveMessagesLocal(messages);
  }

  const conversations = getStoredConversations();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);
  if (convIndex >= 0) {
    const unread = messages.filter(
      (m) => m.conversationId === conversationId && m.senderId !== userId && !m.read
    ).length;
    conversations[convIndex].unreadCount = unread;
    saveConversationsLocal(conversations);
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (hasSupabase) {
    try {
      // Kullanıcının katıldığı konuşmalardaki okunmamış mesajlar
      const { data: convs } = await db
        .from("conversations")
        .select("id")
        .or(`client_id.eq.${userId},lawyer_id.eq.${userId}`);

      if (convs && convs.length > 0) {
        const convIds = convs.map((c: { id: string }) => c.id);
        const { count } = await db
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", convIds)
          .neq("sender_id", userId)
          .eq("read", false);

        return count || 0;
      }
      return 0;
    } catch { /* fallback */ }
  }

  // localStorage fallback
  const conversations = getStoredConversations().filter(
    (c) => c.clientId === userId || c.lawyerId === userId
  );
  const messages = getStoredMessages();

  let total = 0;
  for (const conv of conversations) {
    total += messages.filter(
      (m) => m.conversationId === conv.id && m.senderId !== userId && !m.read
    ).length;
  }
  return total;
}

// =============================================
// Supabase Realtime Subscription
// =============================================

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: ChatMessage) => void
) {
  if (!hasSupabase) return { unsubscribe: () => {} };

  const channel = db
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload: { new: Record<string, unknown> }) => {
        const row = payload.new;
        const senderName = await fetchProfileName(row.sender_id as string);

        onNewMessage({
          id: row.id as string,
          conversationId: row.conversation_id as string,
          senderId: row.sender_id as string,
          senderName,
          senderRole: "client", // Will be overridden by UI
          content: row.content as string,
          timestamp: row.created_at as string,
          read: row.read as boolean,
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      db.removeChannel(channel);
    },
  };
}

// =============================================
// DB Row Mapper
// =============================================

function mapConversationFromDB(
  row: Record<string, unknown>,
  clientName: string,
  lawyerName: string,
  unreadCount: number
): Conversation {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    clientName,
    lawyerId: row.lawyer_id as string,
    lawyerName,
    caseTitle: row.case_title as string | undefined,
    lastMessage: row.last_message as string | undefined,
    lastMessageTime: row.last_message_time as string | undefined,
    unreadCount,
    createdAt: row.created_at as string,
  };
}
