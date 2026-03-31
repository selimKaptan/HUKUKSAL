"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MessageCircle, User, Briefcase, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getConversations, getMessages, sendMessage, markAsRead, type Conversation, type ChatMessage } from "@/lib/messaging";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) { router.push("/auth/login"); return; }
    if (user) setConversations(getConversations(user.id));
  }, [user, loading, router]);

  useEffect(() => {
    if (activeConv && user) {
      setMessages(getMessages(activeConv));
      markAsRead(activeConv, user.id);
      setConversations(getConversations(user.id));
    }
  }, [activeConv, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversations.find((c) => c.id === activeConv);
  const otherParticipant = activeConversation?.participants.find((p) => p.id !== user?.id);

  const handleSend = () => {
    if (!input.trim() || !user || !otherParticipant) return;
    sendMessage(user.id, user.name || "Kullanıcı", user.role, otherParticipant.id, otherParticipant.name, otherParticipant.role, input.trim());
    setInput("");
    setMessages(getMessages(activeConv!));
    setConversations(getConversations(user.id));
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-400">Yükleniyor...</div></div>;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Sol Sidebar - Konuşmalar */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300`}>
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900">Mesajlar</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X className="w-5 h-5" /></button>
          </div>
          <Link href="/dashboard" className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Henüz mesajınız yok</p>
              <p className="text-xs text-slate-400 mt-1">Avukat Bul sayfasından bir avukata mesaj gönderin</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants.find((p) => p.id !== user.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConv(conv.id); setSidebarOpen(false); }}
                  className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${activeConv === conv.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${other?.role === "lawyer" ? "bg-emerald-100" : "bg-blue-100"}`}>
                      {other?.role === "lawyer" ? <Briefcase className="w-5 h-5 text-emerald-600" /> : <User className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900 truncate">{other?.name}</span>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 min-w-[18px] justify-center">{conv.unreadCount}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sağ - Chat Alanı */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-100 px-4 h-14 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          {otherParticipant ? (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${otherParticipant.role === "lawyer" ? "bg-emerald-100" : "bg-blue-100"}`}>
                {otherParticipant.role === "lawyer" ? <Briefcase className="w-4 h-4 text-emerald-600" /> : <User className="w-4 h-4 text-blue-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{otherParticipant.name}</p>
                <p className="text-[10px] text-slate-500">{otherParticipant.role === "lawyer" ? "Avukat" : "Müvekkil"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Bir konuşma seçin</p>
          )}
        </header>

        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto p-4">
          {!activeConv ? (
            <div className="h-full flex flex-col items-center justify-center">
              <MessageCircle className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-slate-500">Bir konuşma seçin veya yeni mesaj gönderin</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-3">
              {messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.senderId === user.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    m.senderId === user.id
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
                  }`}>
                    <p className="text-sm">{m.content}</p>
                    <p className={`text-[10px] mt-1 ${m.senderId === user.id ? "text-blue-200" : "text-slate-400"}`}>
                      {new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {activeConv && (
          <div className="border-t border-slate-100 bg-white px-4 py-3">
            <div className="max-w-2xl mx-auto flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Mesajınızı yazın..."
                className="flex-1 h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-400 focus:bg-white"
              />
              <Button onClick={handleSend} disabled={!input.trim()} size="icon" className="w-10 h-10 rounded-xl">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
