/**
 * Avukat-Müvekkil Mesajlaşma Sistemi
 */

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "lawyer";
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: { id: string; name: string; role: "client" | "lawyer" }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

const MESSAGES_KEY = "jg_messages";
const CONVERSATIONS_KEY = "jg_conversations";

export function getConversations(userId: string): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const all: Conversation[] = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
    return all
      .filter((c) => c.participants.some((p) => p.id === userId))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  } catch { return []; }
}

export function getMessages(conversationId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const all: ChatMessage[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
    return all.filter((m) => {
      const convId = [m.senderId, m.receiverId].sort().join("_");
      return convId === conversationId;
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch { return []; }
}

export function sendMessage(
  senderId: string,
  senderName: string,
  senderRole: "client" | "lawyer",
  receiverId: string,
  receiverName: string,
  receiverRole: "client" | "lawyer",
  content: string
): ChatMessage {
  const msg: ChatMessage = {
    id: `msg_${Date.now()}`,
    senderId,
    senderName,
    senderRole,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    read: false,
  };

  // Mesajı kaydet
  const messages: ChatMessage[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  messages.push(msg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

  // Conversation güncelle
  const conversations: Conversation[] = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
  const convId = [senderId, receiverId].sort().join("_");
  const existingIdx = conversations.findIndex((c) => c.id === convId);

  if (existingIdx >= 0) {
    conversations[existingIdx].lastMessage = content.substring(0, 80);
    conversations[existingIdx].lastMessageAt = msg.createdAt;
    conversations[existingIdx].unreadCount += 1;
  } else {
    conversations.push({
      id: convId,
      participants: [
        { id: senderId, name: senderName, role: senderRole },
        { id: receiverId, name: receiverName, role: receiverRole },
      ],
      lastMessage: content.substring(0, 80),
      lastMessageAt: msg.createdAt,
      unreadCount: 1,
    });
  }
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));

  return msg;
}

export function markAsRead(conversationId: string, userId: string): void {
  const messages: ChatMessage[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  let changed = false;
  for (const m of messages) {
    const convId = [m.senderId, m.receiverId].sort().join("_");
    if (convId === conversationId && m.receiverId === userId && !m.read) {
      m.read = true;
      changed = true;
    }
  }
  if (changed) localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

  const conversations: Conversation[] = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
  const idx = conversations.findIndex((c) => c.id === conversationId);
  if (idx >= 0) {
    conversations[idx].unreadCount = 0;
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  }
}

export function getUnreadCount(userId: string): number {
  const conversations = getConversations(userId);
  return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
}
