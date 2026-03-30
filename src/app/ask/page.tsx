"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ArrowLeft, Send, Loader2, User, Sparkles, MessageCircle, Lightbulb, Plus, Trash2, Menu, X } from "lucide-react";
import Markdown from "react-markdown";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

const EXAMPLE_QUESTIONS = [
  "Isten cikarildim, ne yapmaliyim?",
  "Kiracim kirayi odemiyor, nasil tahliye ederim?",
  "Bosanma davasi ne kadar surer?",
  "Internetten aldigim urun bozuk cikti, haklarim neler?",
  "Miras paylasimindan memnun degilim, ne yapabilirim?",
  "Sosyal medyada bana hakaret edildi, dava acabIlir miyim?",
];

function loadChats(userId: string): ChatSession[] {
  try {
    return JSON.parse(localStorage.getItem(`jg_chats_${userId}`) || "[]");
  } catch { return []; }
}

function saveChats(userId: string, chats: ChatSession[]) {
  localStorage.setItem(`jg_chats_${userId}`, JSON.stringify(chats));
}

export default function AskPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Chatları yükle
  useEffect(() => {
    if (user) {
      const saved = loadChats(user.id);
      setChats(saved);
    }
  }, [user]);

  const currentChat = chats.find((c) => c.id === activeChat);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: `chat_${Date.now()}`,
      title: "Yeni Sohbet",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newChat, ...chats];
    setChats(updated);
    setActiveChat(newChat.id);
    if (user) saveChats(user.id, updated);
    setSidebarOpen(false);
  }, [chats, user]);

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chats.filter((c) => c.id !== chatId);
    setChats(updated);
    if (activeChat === chatId) setActiveChat(updated[0]?.id || null);
    if (user) saveChats(user.id, updated);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    // Aktif chat yoksa yeni oluştur
    let chatId = activeChat;
    let updatedChats = [...chats];

    if (!chatId) {
      const newChat: ChatSession = {
        id: `chat_${Date.now()}`,
        title: messageText.slice(0, 40) + (messageText.length > 40 ? "..." : ""),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      updatedChats = [newChat, ...updatedChats];
      chatId = newChat.id;
      setActiveChat(chatId);
    }

    const chatIdx = updatedChats.findIndex((c) => c.id === chatId);
    if (chatIdx < 0) return;

    // İlk mesajsa başlığı güncelle
    if (updatedChats[chatIdx].messages.length === 0) {
      updatedChats[chatIdx].title = messageText.slice(0, 40) + (messageText.length > 40 ? "..." : "");
    }

    const newMessages: Message[] = [...updatedChats[chatIdx].messages, { role: "user", content: messageText }];
    updatedChats[chatIdx].messages = newMessages;
    setChats([...updatedChats]);
    setInput("");
    setIsLoading(true);
    if (user) saveChats(user.id, updatedChats);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const reply = data.reply || "Uzgunum, yanit veremedim. Tekrar deneyin.";
      updatedChats[chatIdx].messages = [...newMessages, { role: "assistant", content: reply }];
    } catch {
      updatedChats[chatIdx].messages = [...newMessages, { role: "assistant", content: "Baglanti hatasi. Tekrar deneyin." }];
    }

    setChats([...updatedChats]);
    if (user) saveChats(user.id, updatedChats);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">

      {/* Sol Sidebar */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-900 flex flex-col transition-transform duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Hukuk Danismani</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Yeni Sohbet
          </button>
        </div>

        {/* Chat Listesi */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {chats.length === 0 ? (
            <p className="text-xs text-slate-500 text-center mt-8">Henuz sohbet yok</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => { setActiveChat(chat.id); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors group flex items-center justify-between ${
                  activeChat === chat.id
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{chat.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{chat.messages.length} mesaj</p>
                </div>
                <button
                  onClick={(e) => deleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Panele Don
          </Link>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Ana Chat Alanı */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">
                {currentChat ? currentChat.title : "Yeni Sohbet"}
              </span>
            </div>
          </div>
          <button onClick={createNewChat} className="p-2 hover:bg-violet-50 rounded-lg text-violet-600 transition-colors" title="Yeni Sohbet">
            <Plus className="w-5 h-5" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-violet-200">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-1 text-center">Hukuki Sorunuzu Sorun</h1>
              <p className="text-sm text-slate-500 text-center mb-6">Sade ve anlasilir yanit alacaksiniz.</p>
              <div className="w-full grid sm:grid-cols-2 gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)} className="text-left p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 hover:border-violet-300 hover:bg-violet-50 transition-all">
                    <Lightbulb className="w-3 h-3 text-amber-500 inline mr-1.5" />{q}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm"
                    }`}>
                      {m.role === "assistant" ? (
                        <div className="text-sm leading-relaxed prose prose-sm prose-slate max-w-none prose-headings:text-base prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-blockquote:my-2 prose-blockquote:text-amber-800 prose-blockquote:bg-amber-50 prose-blockquote:border-amber-300 prose-blockquote:rounded-lg prose-blockquote:px-3 prose-blockquote:py-2 prose-blockquote:not-italic prose-strong:text-slate-900">
                          <Markdown>{m.content}</Markdown>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" /> Yanit hazirlaniyor...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 bg-white px-4 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl focus-within:border-violet-400 focus-within:bg-white transition-all">
              <div className="flex items-end gap-2 p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hukuki sorunuzu yazin..."
                  rows={1}
                  className="flex-1 resize-none outline-none text-sm text-slate-900 placeholder:text-slate-400 max-h-28 min-h-[36px] py-2 px-2 bg-transparent"
                  style={{ height: Math.min(112, Math.max(36, input.split("\n").length * 22)) }}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="w-9 h-9 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">Genel bilgilendirme amaclidir, avukatlik hizmeti yerine gecmez.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
