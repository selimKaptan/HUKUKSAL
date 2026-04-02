"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Scale, ArrowLeft, Send, MessageCircle, User, Clock,
  CheckCheck, Search, Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  getConversationsByUser,
  getMessages,
  sendMessage,
  markAsRead,
  subscribeToMessages,
  type Conversation,
  type ChatMessage,
} from "@/lib/chat-service";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const convs = await getConversationsByUser(user.id);
    setConversations(convs);
    setLoading(false);
  }, [user]);

  // Konuşmaları yükle
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user, loadConversations]);

  // Konuşma seçildiğinde mesajları yükle
  useEffect(() => {
    if (!selectedConv || !user) return;

    const loadMessages = async () => {
      const msgs = await getMessages(selectedConv.id);
      setMessages(msgs);
      await markAsRead(selectedConv.id, user.id);

      // Konuşma listesinde unread count'u sıfırla
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id ? { ...c, unreadCount: 0 } : c
        )
      );
    };

    loadMessages();

    // Realtime subscription
    const sub = subscribeToMessages(selectedConv.id, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      // Otomatik okundu işaretle
      if (newMsg.senderId !== user.id) {
        markAsRead(selectedConv.id, user.id);
      }
    });

    return () => sub.unsubscribe();
  }, [selectedConv, user]);

  // Mesaj geldiğinde en alta scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || !user || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    const msg = await sendMessage(
      selectedConv.id,
      user.id,
      user.name || "Kullanıcı",
      user.role as "client" | "lawyer" | "admin",
      content
    );

    setMessages((prev) => [...prev, msg]);

    // Konuşma listesini güncelle
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? { ...c, lastMessage: content, lastMessageTime: msg.timestamp }
          : c
      )
    );

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherName = (conv: Conversation) => {
    if (!user) return "";
    return user.id === conv.clientId ? conv.lawyerName : conv.clientName;
  };

  const getOtherRole = (conv: Conversation) => {
    if (!user) return "";
    return user.id === conv.clientId ? "Avukat" : "Müvekkil";
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm) return true;
    const name = getOtherName(c).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Dün";
    if (diffDays < 7) return d.toLocaleDateString("tr-TR", { weekday: "short" });
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Lütfen giriş yapın.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Haklarım
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <MessageCircle className="w-7 h-7 text-blue-600" /> Mesajlar
        </h1>

        <div className="grid md:grid-cols-[360px_1fr] gap-6 h-[calc(100vh-200px)]">
          {/* Sol Panel - Konuşma Listesi */}
          <Card className="overflow-hidden flex flex-col">
            {/* Arama */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Konuşma ara..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Konuşma Listesi */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Henüz mesajınız yok</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Avukat bul sayfasından bir avukata mesaj gönderin
                  </p>
                  <Link href="/tools/find-lawyer">
                    <Button size="sm" className="mt-4">Avukat Bul</Button>
                  </Link>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-4 border-b border-slate-50 hover:bg-blue-50/50 transition-colors ${
                      selectedConv?.id === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {getOtherName(conv).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {getOtherName(conv)}
                          </span>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {formatTime(conv.lastMessageTime || conv.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{getOtherRole(conv)}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Sağ Panel - Mesajlar */}
          <Card className="overflow-hidden flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">Bir konuşma seçin</p>
                </div>
              </div>
            ) : (
              <>
                {/* Üst Bar */}
                <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {getOtherName(selectedConv).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{getOtherName(selectedConv)}</h3>
                    <p className="text-xs text-slate-500">{getOtherRole(selectedConv)}</p>
                  </div>
                  {selectedConv.caseTitle && (
                    <Badge variant="outline" className="ml-auto text-xs">{selectedConv.caseTitle}</Badge>
                  )}
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-slate-400">Henüz mesaj yok. İlk mesajı gönderin!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.senderId === user.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isMine
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-slate-100 text-slate-900 rounded-bl-md"
                            }`}
                          >
                            {!isMine && (
                              <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                                <User className="w-3 h-3" /> {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                              <Clock className={`w-3 h-3 ${isMine ? "text-blue-200" : "text-slate-400"}`} />
                              <span className={`text-[10px] ${isMine ? "text-blue-200" : "text-slate-400"}`}>
                                {formatTime(msg.timestamp)}
                              </span>
                              {isMine && msg.read && (
                                <CheckCheck className="w-3 h-3 text-blue-200" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Mesaj Gönderme */}
                <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="h-11 w-11 p-0 rounded-xl"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
