"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  MessageSquare,
  Send,
  User,
  ArrowLeft,
  Plus,
  Check,
  CheckCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth, getRegisteredLawyers } from "@/lib/auth-context";
import type { User as AuthUser } from "@/lib/auth-context";
import {
  createConversation,
  getConversationsByUser,
  getMessages,
  sendMessage,
  markAsRead,
  type Conversation,
  type ChatMessage,
} from "@/lib/chat-service";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Dun";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("tr-TR", { weekday: "short" });
  }
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function ChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [lawyers, setLawyers] = useState<AuthUser[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Load conversations
  const loadConversations = useCallback(() => {
    if (!user) return;
    setConversations(getConversationsByUser(user.id));
  }, [user]);

  useEffect(() => {
    loadConversations();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConvId || !user) return;
    const msgs = getMessages(selectedConvId);
    setMessages(msgs);
    markAsRead(selectedConvId, user.id);
    loadConversations();
  }, [selectedConvId, user, loadConversations]);

  // Poll messages for active conversation
  useEffect(() => {
    if (!selectedConvId || !user) return;
    const interval = setInterval(() => {
      const msgs = getMessages(selectedConvId);
      setMessages(msgs);
      markAsRead(selectedConvId, user.id);
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedConvId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load lawyers for new conversation modal
  useEffect(() => {
    if (showNewModal) {
      const allLawyers = getRegisteredLawyers();
      // Filter out self
      setLawyers(allLawyers.filter((l) => l.id !== user?.id));
    }
  }, [showNewModal, user]);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConvId
  );

  const getOtherPersonName = (conv: Conversation) => {
    if (!user) return "";
    return conv.clientId === user.id ? conv.lawyerName : conv.clientName;
  };

  const getOtherPersonRole = (conv: Conversation): "client" | "lawyer" => {
    if (!user) return "client";
    return conv.clientId === user.id ? "lawyer" : "client";
  };

  const getUnreadForConv = (conv: Conversation) => {
    if (!user) return 0;
    return messages.filter
      ? getMessages(conv.id).filter(
          (m) => m.senderId !== user.id && !m.read
        ).length
      : 0;
  };

  const handleSend = () => {
    if (!messageText.trim() || !selectedConvId || !user) return;
    sendMessage(
      selectedConvId,
      user.id,
      user.name || user.email,
      user.role,
      messageText.trim()
    );
    setMessageText("");
    // Refresh messages
    setMessages(getMessages(selectedConvId));
    loadConversations();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartConversation = (lawyer: AuthUser) => {
    if (!user) return;
    const conv = createConversation(
      user.id,
      user.name || user.email,
      lawyer.id,
      lawyer.name || lawyer.email,
      undefined
    );
    setShowNewModal(false);
    setSelectedConvId(conv.id);
    setShowSidebar(false);
    loadConversations();
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConvId(convId);
    setShowSidebar(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Yukleniyor...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-slate-600" />
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Justice<span className="text-blue-600">Guard</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm">Yeni Analiz</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* Sidebar overlay for mobile */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`
            ${showSidebar ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            fixed md:relative z-50 md:z-auto
            w-80 h-[calc(100vh-4rem)] bg-white border-r border-slate-100
            flex flex-col transition-transform duration-200 ease-in-out
          `}
        >
          {/* Sidebar header */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-900">Mesajlar</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => setShowNewModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Mesaj
            </Button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Henuz mesajiniz yok. Avukat bul sayfasindan bir avukata mesaj
                  gonderin.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const otherName = getOtherPersonName(conv);
                const otherRole = getOtherPersonRole(conv);
                const unread = getUnreadForConv(conv);

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${
                      selectedConvId === conv.id ? "bg-blue-50/60" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-sm text-slate-900 truncate">
                            {otherName}
                          </span>
                          <Badge
                            variant={
                              otherRole === "lawyer" ? "success" : "default"
                            }
                            className="text-[10px] px-1.5 py-0"
                          >
                            {otherRole === "lawyer" ? "Avukat" : "Muvekkil"}
                          </Badge>
                        </div>
                        {conv.lastMessageTime && (
                          <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      {conv.caseTitle && (
                        <p className="text-[11px] text-blue-500 truncate mb-0.5">
                          {conv.caseTitle}
                        </p>
                      )}
                      {conv.lastMessage && (
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
          {!selectedConversation ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  Bir konusma secin
                </h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Sol taraftan bir konusma secin veya yeni bir mesaj baslatin.
                </p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedConvId(null);
                    setShowSidebar(true);
                  }}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 truncate">
                      {getOtherPersonName(selectedConversation)}
                    </h3>
                    <Badge
                      variant={
                        getOtherPersonRole(selectedConversation) === "lawyer"
                          ? "success"
                          : "default"
                      }
                      className="text-[10px] px-1.5 py-0"
                    >
                      {getOtherPersonRole(selectedConversation) === "lawyer"
                        ? "Avukat"
                        : "Muvekkil"}
                    </Badge>
                  </div>
                  {selectedConversation.caseTitle && (
                    <p className="text-xs text-blue-500 truncate">
                      {selectedConversation.caseTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-slate-400">
                      Henuz mesaj yok. Bir mesaj gondererek konusmayi baslatin.
                    </p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isSelf = msg.senderId === user.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 ${
                          isSelf
                            ? msg.senderRole === "lawyer"
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 text-white"
                            : msg.senderRole === "lawyer"
                              ? "bg-emerald-50 text-slate-900 border border-emerald-100"
                              : "bg-blue-50 text-slate-900 border border-blue-100"
                        }`}
                      >
                        {!isSelf && (
                          <p
                            className={`text-[11px] font-semibold mb-1 ${
                              msg.senderRole === "lawyer"
                                ? "text-emerald-600"
                                : "text-blue-600"
                            }`}
                          >
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${
                            isSelf ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          <span className="text-[10px]">
                            {new Date(msg.timestamp).toLocaleTimeString(
                              "tr-TR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {isSelf &&
                            (msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="bg-white border-t border-slate-100 p-3 sm:p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Mesaj yazin..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    className="rounded-xl h-10 w-10 p-0 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* New conversation modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-md bg-white shadow-2xl p-0">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      Yeni Mesaj
                    </h3>
                    <button
                      onClick={() => setShowNewModal(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Mesaj gondermek istediginiz avukati secin
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {lawyers.length === 0 ? (
                    <div className="p-8 text-center">
                      <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        Henuz kayitli avukat bulunamadi.
                      </p>
                    </div>
                  ) : (
                    lawyers.map((lawyer) => (
                      <button
                        key={lawyer.id}
                        onClick={() => handleStartConversation(lawyer)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {lawyer.name || lawyer.email}
                          </p>
                          {lawyer.lawyerProfile && (
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500">
                                {lawyer.lawyerProfile.city}
                              </span>
                              <span className="text-slate-300">-</span>
                              <span className="text-xs text-slate-500">
                                {lawyer.lawyerProfile.barAssociation}
                              </span>
                            </div>
                          )}
                          {lawyer.lawyerProfile?.specialties &&
                            lawyer.lawyerProfile.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {lawyer.lawyerProfile.specialties
                                  .slice(0, 3)
                                  .map((s) => (
                                    <Badge
                                      key={s}
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {s}
                                    </Badge>
                                  ))}
                              </div>
                            )}
                        </div>
                        <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
