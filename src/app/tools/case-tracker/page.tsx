"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Bell,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  saveTracking,
  getTrackingsByUser,
  updateTracking,
  deleteTracking,
  addReminder,
  completeReminder,
  getUpcomingReminders,
  getOverdueReminders,
  type CaseTracking,
  type CaseReminder,
} from "@/lib/case-tracker";

const STATUS_LABELS: Record<CaseTracking["status"], string> = {
  aktif: "Aktif",
  beklemede: "Beklemede",
  "sonuçlandı": "Sonuçlandı",
  temyizde: "Temyizde",
};

const STATUS_VARIANTS: Record<CaseTracking["status"], "default" | "success" | "warning" | "danger" | "outline"> = {
  aktif: "success",
  beklemede: "warning",
  "sonuçlandı": "outline",
  temyizde: "default",
};

const REMINDER_TYPE_LABELS: Record<CaseReminder["type"], string> = {
  "zamanaşımı": "Zamanaşımı",
  "duruşma": "Duruşma",
  belge_teslim: "Belge Teslim",
  "itiraz_süresi": "İtiraz Süresi",
  "temyiz_süresi": "Temyiz Süresi",
  genel: "Genel",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function CaseTrackerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [trackings, setTrackings] = useState<CaseTracking[]>([]);
  const [upcoming, setUpcoming] = useState<CaseReminder[]>([]);
  const [overdue, setOverdue] = useState<CaseReminder[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState<string | null>(null);

  // New tracking form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStatus, setNewStatus] = useState<CaseTracking["status"]>("aktif");
  const [newHearing, setNewHearing] = useState("");

  // New reminder form state
  const [remTitle, setRemTitle] = useState("");
  const [remType, setRemType] = useState<CaseReminder["type"]>("genel");
  const [remDate, setRemDate] = useState("");
  const [remDesc, setRemDesc] = useState("");

  // Add note state
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      refreshData();
    }
  }, [user, authLoading, router]);

  function refreshData() {
    if (!user) return;
    setTrackings(getTrackingsByUser(user.id));
    setUpcoming(getUpcomingReminders(user.id, 7));
    setOverdue(getOverdueReminders(user.id));
  }

  function handleAddTracking() {
    if (!user || !newTitle.trim() || !newCategory.trim()) return;
    saveTracking(user.id, {
      caseId: `c_${Date.now()}`,
      userId: user.id,
      caseTitle: newTitle.trim(),
      category: newCategory.trim(),
      status: newStatus,
      nextHearing: newHearing || undefined,
      notes: [],
      reminders: [],
    });
    setNewTitle("");
    setNewCategory("");
    setNewStatus("aktif");
    setNewHearing("");
    setShowNewForm(false);
    refreshData();
  }

  function handleDeleteTracking(id: string) {
    deleteTracking(id);
    refreshData();
  }

  function handleAddNote(trackingId: string) {
    const text = noteInput[trackingId]?.trim();
    if (!text) return;
    const tracking = trackings.find((t) => t.id === trackingId);
    if (!tracking) return;
    updateTracking(trackingId, { notes: [...tracking.notes, text] });
    setNoteInput((prev) => ({ ...prev, [trackingId]: "" }));
    refreshData();
  }

  function handleAddReminder(trackingId: string) {
    if (!user || !remTitle.trim() || !remDate) return;
    addReminder(trackingId, {
      caseId: trackingId,
      userId: user.id,
      title: remTitle.trim(),
      description: remDesc.trim(),
      dueDate: new Date(remDate).toISOString(),
      type: remType,
    });
    setRemTitle("");
    setRemType("genel");
    setRemDate("");
    setRemDesc("");
    setShowReminderForm(null);
    refreshData();
  }

  function handleCompleteReminder(trackingId: string, reminderId: string) {
    completeReminder(trackingId, reminderId);
    refreshData();
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-black text-slate-900">Dava Takip Sistemi</h1>
          <Button onClick={() => setShowNewForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Yeni Takip
          </Button>
        </div>
        <p className="text-slate-500 mb-8">Davalarınızı takip edin ve hatırlatmalar oluşturun</p>

        {/* Overdue Warning Banner */}
        {overdue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-800">
              {overdue.length} adet süresi geçmiş hatırlatmanız var!
            </span>
          </motion.div>
        )}

        {/* Upcoming Reminders */}
        {upcoming.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                <Bell className="w-5 h-5" /> Yaklaşan Hatırlatmalar (7 Gün)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcoming.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{r.title}</span>
                      <span className="text-xs text-slate-500 ml-2">{REMINDER_TYPE_LABELS[r.type]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600">{formatDate(r.dueDate)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* New Tracking Form */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Yeni Dava Takibi Ekle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Dava Başlığı</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ör: Kira uyuşmazlığı davası"
                        className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Kategori</label>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Ör: Kira Hukuku"
                        className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Durum</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as CaseTracking["status"])}
                        className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Sonraki Duruşma Tarihi</label>
                      <input
                        type="date"
                        value={newHearing}
                        onChange={(e) => setNewHearing(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddTracking} disabled={!newTitle.trim() || !newCategory.trim()}>
                      <Plus className="w-4 h-4 mr-2" /> Ekle
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewForm(false)}>
                      İptal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tracked Cases */}
        {trackings.length === 0 && !showNewForm ? (
          <Card className="text-center py-16">
            <CardContent>
              <Scale className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Henüz takip edilen dava yok</h3>
              <p className="text-slate-500 mb-6 text-sm">Yeni bir dava takibi ekleyerek başlayın</p>
              <Button onClick={() => setShowNewForm(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Yeni Takip Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trackings.map((t) => {
              const isExpanded = expandedId === t.id;
              const pendingReminders = t.reminders.filter((r) => r.status !== "completed").length;

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card className="overflow-hidden">
                    {/* Card Header - always visible */}
                    <div
                      className="p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 truncate">{t.caseTitle}</h3>
                            <Badge variant={STATUS_VARIANTS[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="font-medium text-slate-600">{t.category}</span>
                            {t.nextHearing && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(t.nextHearing)}
                              </span>
                            )}
                            {pendingReminders > 0 && (
                              <span className="flex items-center gap-1.5">
                                <Bell className="w-3.5 h-3.5" />
                                {pendingReminders} hatırlatma
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTracking(t.id);
                            }}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 space-y-6 border-t border-slate-100 pt-4">
                            {/* Notes Section */}
                            <div>
                              <h4 className="text-sm font-bold text-slate-700 mb-3">Notlar</h4>
                              {t.notes.length > 0 ? (
                                <ul className="space-y-2 mb-3">
                                  {t.notes.map((note, i) => (
                                    <li key={i} className="text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-2.5">
                                      {note}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-400 mb-3">Henüz not eklenmemiş</p>
                              )}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={noteInput[t.id] || ""}
                                  onChange={(e) => setNoteInput((prev) => ({ ...prev, [t.id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddNote(t.id)}
                                  placeholder="Not ekle..."
                                  className="flex-1 h-10 px-4 rounded-lg border-2 border-slate-200 bg-white text-sm text-slate-900 focus:border-blue-500 outline-none"
                                />
                                <Button size="sm" onClick={() => handleAddNote(t.id)} disabled={!noteInput[t.id]?.trim()}>
                                  Ekle
                                </Button>
                              </div>
                            </div>

                            {/* Reminders Section */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-slate-700">Hatırlatmalar</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowReminderForm(showReminderForm === t.id ? null : t.id)}
                                  className="gap-1.5 text-xs"
                                >
                                  <Bell className="w-3.5 h-3.5" /> Hatırlatma Ekle
                                </Button>
                              </div>

                              {t.reminders.length > 0 ? (
                                <div className="space-y-2 mb-3">
                                  {t.reminders.map((r) => {
                                    const isOverdue = r.status !== "completed" && new Date(r.dueDate) < new Date();
                                    const displayStatus = r.status === "completed" ? "completed" : isOverdue ? "overdue" : "pending";
                                    return (
                                      <div
                                        key={r.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${
                                          displayStatus === "overdue"
                                            ? "bg-red-50 border-red-200"
                                            : displayStatus === "completed"
                                            ? "bg-emerald-50 border-emerald-200"
                                            : "bg-blue-50 border-blue-200"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          {displayStatus === "completed" ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                          ) : displayStatus === "overdue" ? (
                                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                          ) : (
                                            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                          )}
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-sm font-semibold text-slate-800">{r.title}</span>
                                              <Badge
                                                variant={
                                                  displayStatus === "overdue"
                                                    ? "danger"
                                                    : displayStatus === "completed"
                                                    ? "success"
                                                    : "default"
                                                }
                                                className="text-[10px] px-2 py-0.5"
                                              >
                                                {REMINDER_TYPE_LABELS[r.type]}
                                              </Badge>
                                            </div>
                                            {r.description && (
                                              <p className="text-xs text-slate-500 truncate">{r.description}</p>
                                            )}
                                            <span className="text-xs text-slate-400">{formatDate(r.dueDate)}</span>
                                          </div>
                                        </div>
                                        {displayStatus !== "completed" && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCompleteReminder(t.id, r.id)}
                                            className="text-emerald-600 hover:text-emerald-700 flex-shrink-0"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400 mb-3">Henüz hatırlatma eklenmemiş</p>
                              )}

                              {/* Add Reminder Form */}
                              <AnimatePresence>
                                {showReminderForm === t.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                                      <div className="grid md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                          <label className="text-xs font-semibold text-slate-600">Başlık</label>
                                          <input
                                            type="text"
                                            value={remTitle}
                                            onChange={(e) => setRemTitle(e.target.value)}
                                            placeholder="Hatırlatma başlığı"
                                            className="w-full h-10 px-3 rounded-lg border-2 border-slate-200 bg-white text-sm text-slate-900 focus:border-blue-500 outline-none"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="text-xs font-semibold text-slate-600">Tür</label>
                                          <select
                                            value={remType}
                                            onChange={(e) => setRemType(e.target.value as CaseReminder["type"])}
                                            className="w-full h-10 px-3 rounded-lg border-2 border-slate-200 bg-white text-sm text-slate-900 focus:border-blue-500 outline-none"
                                          >
                                            {Object.entries(REMINDER_TYPE_LABELS).map(([key, label]) => (
                                              <option key={key} value={key}>{label}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="text-xs font-semibold text-slate-600">Tarih</label>
                                          <input
                                            type="date"
                                            value={remDate}
                                            onChange={(e) => setRemDate(e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border-2 border-slate-200 bg-white text-sm text-slate-900 focus:border-blue-500 outline-none"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="text-xs font-semibold text-slate-600">Açıklama</label>
                                          <input
                                            type="text"
                                            value={remDesc}
                                            onChange={(e) => setRemDesc(e.target.value)}
                                            placeholder="Opsiyonel açıklama"
                                            className="w-full h-10 px-3 rounded-lg border-2 border-slate-200 bg-white text-sm text-slate-900 focus:border-blue-500 outline-none"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleAddReminder(t.id)} disabled={!remTitle.trim() || !remDate}>
                                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Ekle
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setShowReminderForm(null)}>
                                          İptal
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
