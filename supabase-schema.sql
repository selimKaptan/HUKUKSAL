-- JusticeGuard Supabase Schema
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cases table
CREATE TABLE public.cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'is_hukuku', 'aile_hukuku', 'ticaret_hukuku', 'ceza_hukuku',
    'tuketici_hukuku', 'kira_hukuku', 'miras_hukuku', 'idare_hukuku',
    'icra_iflas', 'diger'
  )),
  event_summary TEXT NOT NULL,
  win_probability INTEGER,
  analysis_report TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  recommendation TEXT CHECK (recommendation IN ('file_case', 'do_not_file', 'needs_review')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'completed', 'error'))
);

-- Evidences table
CREATE TABLE public.evidences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  extracted_text TEXT
);

-- Precedents table
CREATE TABLE public.precedents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  court TEXT NOT NULL,
  case_number TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  ruling TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('plaintiff_won', 'defendant_won', 'settled', 'dismissed'))
);

-- Indexes
CREATE INDEX idx_cases_user_id ON public.cases(user_id);
CREATE INDEX idx_cases_category ON public.cases(category);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_evidences_case_id ON public.evidences(case_id);
CREATE INDEX idx_precedents_category ON public.precedents(category);
CREATE INDEX idx_precedents_outcome ON public.precedents(outcome);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
