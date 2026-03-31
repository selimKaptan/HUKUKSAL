"use client";

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

function saveConversations(conversations: Conversation[]) {
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

function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function createConversation(
  clientId: string,
  clientName: string,
  lawyerId: string,
  lawyerName: string,
  caseTitle?: string
): Conversation {
  const conversations = getStoredConversations();

  // Check if conversation already exists between these two users
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
  saveConversations(conversations);
  return conversation;
}

export function getConversationsByUser(userId: string): Conversation[] {
  const conversations = getStoredConversations();
  return conversations
    .filter((c) => c.clientId === userId || c.lawyerId === userId)
    .sort((a, b) => {
      const timeA = a.lastMessageTime || a.createdAt;
      const timeB = b.lastMessageTime || b.createdAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
}

export function getMessages(conversationId: string): ChatMessage[] {
  const messages = getStoredMessages();
  return messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: "client" | "lawyer" | "admin",
  content: string
): ChatMessage {
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
  saveMessages(messages);

  // Update conversation last message info
  const conversations = getStoredConversations();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);
  if (convIndex >= 0) {
    conversations[convIndex].lastMessage = content;
    conversations[convIndex].lastMessageTime = message.timestamp;
    conversations[convIndex].unreadCount += 1;
    saveConversations(conversations);
  }

  return message;
}

export function markAsRead(conversationId: string, userId: string): void {
  const messages = getStoredMessages();
  let changed = false;

  for (const msg of messages) {
    if (msg.conversationId === conversationId && msg.senderId !== userId && !msg.read) {
      msg.read = true;
      changed = true;
    }
  }

  if (changed) {
    saveMessages(messages);
  }

  // Reset unread count on conversation
  const conversations = getStoredConversations();
  const convIndex = conversations.findIndex((c) => c.id === conversationId);
  if (convIndex >= 0) {
    // Recalculate unread count for this user
    const unread = messages.filter(
      (m) =>
        m.conversationId === conversationId &&
        m.senderId !== userId &&
        !m.read
    ).length;
    conversations[convIndex].unreadCount = unread;
    saveConversations(conversations);
  }
}

export function getUnreadCount(userId: string): number {
  const conversations = getConversationsByUser(userId);
  const messages = getStoredMessages();

  let total = 0;
  for (const conv of conversations) {
    total += messages.filter(
      (m) =>
        m.conversationId === conv.id &&
        m.senderId !== userId &&
        !m.read
    ).length;
  }
  return total;
}
