"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, Plus, X, Check, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getEvents, addEvent, toggleEvent, deleteEvent,
  EVENT_TYPE_CONFIG, type EventType, type LegalEvent,
} from "@/lib/legal-calendar";

export default function TakvimPage() {
  const [events, setEvents] = useState<LegalEvent[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", type: "diger" as EventType, description: "", reminderDays: 7 });

  useEffect(() => { setEvents(getEvents()); }, []);

  const handleAdd = () => {
    if (!newEvent.title || !newEvent.date) return;
    addEvent(newEvent);
    setEvents(getEvents());
    setShowAdd(false);
    setNewEvent({ title: "", date: "", type: "diger", description: "", reminderDays: 7 });
  };

  const handleToggle = (id: string) => { toggleEvent(id); setEvents(getEvents()); };
  const handleDelete = (id: string) => { deleteEvent(id); setEvents(getEvents()); };

  const upcoming = events.filter((e) => !e.completed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completed = events.filter((e) => e.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-slate-900">Haklarım</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Geri</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> Hukuki Takvim
          </h1>
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1">
            <Plus className="w-4 h-4" /> Etkinlik Ekle
          </Button>
        </div>

        {/* Yaklaşan */}
        <h2 className="text-sm font-semibold text-slate-500 mb-3">Yaklaşan ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <Card className="mb-6"><CardContent className="p-8 text-center text-slate-400 text-sm">Yaklaşan etkinlik yok</CardContent></Card>
        ) : (
          <div className="space-y-2 mb-6">
            {upcoming.map((e) => {
              const config = EVENT_TYPE_CONFIG[e.type];
              const daysLeft = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
              return (
                <Card key={e.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <button onClick={() => handleToggle(e.id)} className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-900">{e.title}</span>
                        <Badge className={`text-[10px] ${config.color}`}>{config.emoji} {config.label}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{e.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(e.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-bold ${daysLeft <= 7 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-slate-600"}`}>
                        {daysLeft} gün
                      </span>
                      <button onClick={() => handleDelete(e.id)} className="block mt-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tamamlanan */}
        {completed.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-slate-400 mb-3">Tamamlanan ({completed.length})</h2>
            <div className="space-y-2">
              {completed.map((e) => (
                <Card key={e.id} className="opacity-60">
                  <CardContent className="p-4 flex items-center gap-3">
                    <button onClick={() => handleToggle(e.id)} className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </button>
                    <span className="text-sm text-slate-500 line-through flex-1">{e.title}</span>
                    <button onClick={() => handleDelete(e.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Ekle Modal */}
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} className="bg-white rounded-t-3xl w-full max-w-lg p-6 safe-area-bottom">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Etkinlik Ekle</h3>
                <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Başlık" value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm" />
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm" />
                <select value={newEvent.type} onChange={(e) => setNewEvent((p) => ({ ...p, type: e.target.value as EventType }))}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm">
                  {Object.entries(EVENT_TYPE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
                  ))}
                </select>
                <textarea placeholder="Açıklama" value={newEvent.description} onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none" rows={2} />
                <select value={newEvent.reminderDays} onChange={(e) => setNewEvent((p) => ({ ...p, reminderDays: parseInt(e.target.value) }))}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm">
                  <option value={1}>1 gün önce hatırlat</option>
                  <option value={3}>3 gün önce hatırlat</option>
                  <option value={7}>1 hafta önce hatırlat</option>
                  <option value={14}>2 hafta önce hatırlat</option>
                  <option value={30}>1 ay önce hatırlat</option>
                </select>
                <Button onClick={handleAdd} className="w-full" disabled={!newEvent.title || !newEvent.date}>Ekle</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
