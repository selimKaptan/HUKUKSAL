export interface Case {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  category: CaseCategory;
  event_summary: string;
  win_probability: number | null;
  analysis_report: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendation: "file_case" | "do_not_file" | "needs_review" | null;
  status: "draft" | "analyzing" | "completed" | "error";
}

export interface Evidence {
  id: string;
  created_at: string;
  case_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  description: string | null;
  extracted_text: string | null;
}

export interface Precedent {
  id: string;
  created_at: string;
  court: string;
  case_number: string;
  date: string;
  category: CaseCategory;
  summary: string;
  ruling: string;
  keywords: string[];
  outcome: "plaintiff_won" | "defendant_won" | "settled" | "dismissed";
  relevance_score?: number;
  duration_days?: number; // Davanın kaç günde sonuçlandığı
}

export type CaseCategory =
  | "is_hukuku"
  | "aile_hukuku"
  | "ticaret_hukuku"
  | "ceza_hukuku"
  | "tuketici_hukuku"
  | "kira_hukuku"
  | "miras_hukuku"
  | "idare_hukuku"
  | "icra_iflas"
  | "diger";

export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  is_hukuku: "İş Hukuku",
  aile_hukuku: "Aile Hukuku",
  ticaret_hukuku: "Ticaret Hukuku",
  ceza_hukuku: "Ceza Hukuku",
  tuketici_hukuku: "Tüketici Hukuku",
  kira_hukuku: "Kira Hukuku",
  miras_hukuku: "Miras Hukuku",
  idare_hukuku: "İdare Hukuku",
  icra_iflas: "İcra & İflas Hukuku",
  diger: "Diğer",
};

export interface AnalysisResult {
  winProbability: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: "file_case" | "do_not_file" | "needs_review";
  analysisReport: string;
  matchedPrecedents: (Precedent & { relevance_score: number })[];
  riskFactors: string[];
  suggestedActions: string[];
  estimatedDuration?: {
    minDays: number;
    maxDays: number;
    avgDays: number;
    description: string;
    phases: { name: string; duration: string }[];
    precedentDurations: { case_number: string; court: string; duration_days: number; duration_label: string }[];
  };
}

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: Case;
        Insert: Omit<Case, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Case, "id" | "created_at">>;
      };
      evidences: {
        Row: Evidence;
        Insert: Omit<Evidence, "id" | "created_at">;
        Update: Partial<Omit<Evidence, "id" | "created_at">>;
      };
      precedents: {
        Row: Precedent;
        Insert: Omit<Precedent, "id" | "created_at">;
        Update: Partial<Omit<Precedent, "id" | "created_at">>;
      };
    };
  };
}
