"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ArrowLeft, Send, Loader2, User, Sparkles, MessageCircle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUESTIONS = [
  "Isten cikarildim, ne yapmaliyim?",
  "Kiracim kirayi odemiyor, nasil tahliye ederim?",
  "Bosanma davasi ne kadar surer?",
  "Internetten aldigim urun bozuk cikti, haklarim neler?",
  "Miras paylasimindan memnun degilim, ne yapabilirim?",
  "Sosyal medyada bana hakaret edildi, dava acabIlir miyim?",
];

export default function AskPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: messageText }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "Uzgunum, su anda yanit veremedim. Lutfen tekrar deneyin." }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Baglanti hatasi olustu. Lutfen tekrar deneyin." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">Justice<span className="text-blue-600">Guard</span></span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-3 py-1">
              <MessageCircle className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-semibold text-violet-700">AI Hukuk Danismani</span>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Panel</Button>
          </Link>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col">

        {/* Boş durum - Örnek sorular */}
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-violet-200">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 text-center">Hukuki Sorunuzu Sorun</h1>
            <p className="text-slate-500 text-center max-w-md mb-8">
              {user?.name ? `${user.name}, hukuki` : "Hukuki"} konularda merak ettiginiz her seyi sorabilirsiniz. Sade ve anlasilir bir dille yanit alacaksiniz.
            </p>

            <div className="w-full max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">Ornek Sorular</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mesajlar */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm"
                  }`}>
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${m.role === "assistant" ? "prose-sm" : ""}`}>
                      {m.content}
                    </div>
                  </div>
                  {m.role === "user" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yanit hazirlaniyor...
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-4">
          <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-lg focus-within:border-violet-400 focus-within:shadow-violet-100 transition-all">
            <div className="flex items-end gap-2 p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hukuki sorunuzu yazin..."
                rows={1}
                className="flex-1 resize-none outline-none text-sm text-slate-900 placeholder:text-slate-400 max-h-32 min-h-[40px] py-2 px-2"
                style={{ height: Math.min(128, Math.max(40, input.split("\n").length * 24)) }}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-200 flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Bu hizmet genel bilgilendirme amaclidir, avukatlik hizmeti yerine gecmez.
          </p>
        </div>
      </div>
    </div>
  );
}
