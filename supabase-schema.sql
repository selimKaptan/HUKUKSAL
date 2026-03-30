-- =============================================
-- JusticeGuard Supabase Schema v2
-- Supabase SQL Editor'de çalıştırın
-- =============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES (Kullanıcı profilleri - Auth ile bağlantılı)
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'lawyer')),
  avatar_url TEXT
);

-- =============================================
-- 2. LAWYER_PROFILES (Avukat detay bilgileri)
-- =============================================
CREATE TABLE public.lawyer_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  title TEXT DEFAULT 'Avukat',
  bar_association TEXT NOT NULL,
  city TEXT NOT NULL,
  specialties TEXT[] NOT NULL,
  experience INTEGER DEFAULT 0,
  phone TEXT,
  about TEXT,
  consultation_fee TEXT DEFAULT 'Belirtilmemiş',
  languages TEXT[] DEFAULT ARRAY['Türkçe'],
  is_verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0
);

-- =============================================
-- 3. CASES (Müvekkil dava analizleri)
-- =============================================
CREATE TABLE public.cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'is_hukuku', 'aile_hukuku', 'ticaret_hukuku', 'ceza_hukuku',
    'tuketici_hukuku', 'kira_hukuku', 'miras_hukuku', 'idare_hukuku',
    'icra_iflas', 'diger'
  )),
  event_summary TEXT NOT NULL,
  additional_notes TEXT,
  opposing_party TEXT,
  event_date DATE,
  win_probability INTEGER,
  analysis_report TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  risk_factors TEXT[],
  suggested_actions TEXT[],
  recommendation TEXT CHECK (recommendation IN ('file_case', 'do_not_file', 'needs_review')),
  estimated_duration_days INTEGER,
  ai_provider TEXT DEFAULT 'local' CHECK (ai_provider IN ('claude', 'local')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'completed', 'error'))
);

-- =============================================
-- 4. EVIDENCES (Yüklenen belgeler)
-- =============================================
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

-- =============================================
-- 5. PRECEDENTS (Emsal kararlar)
-- =============================================
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
  outcome TEXT NOT NULL CHECK (outcome IN ('plaintiff_won', 'defendant_won', 'settled', 'dismissed')),
  duration_days INTEGER
);

-- =============================================
-- 6. LAWYER_REVIEWS (Avukat değerlendirmeleri)
-- =============================================
CREATE TABLE public.lawyer_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  lawyer_id UUID REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  UNIQUE(lawyer_id, client_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_lawyer_profiles_city ON public.lawyer_profiles(city);
CREATE INDEX idx_lawyer_profiles_specialties ON public.lawyer_profiles USING GIN(specialties);
CREATE INDEX idx_lawyer_profiles_verified ON public.lawyer_profiles(is_verified);
CREATE INDEX idx_cases_user_id ON public.cases(user_id);
CREATE INDEX idx_cases_category ON public.cases(category);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_created ON public.cases(created_at DESC);
CREATE INDEX idx_evidences_case_id ON public.evidences(case_id);
CREATE INDEX idx_precedents_category ON public.precedents(category);
CREATE INDEX idx_lawyer_reviews_lawyer ON public.lawyer_reviews(lawyer_id);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lawyer_profiles_updated_at BEFORE UPDATE ON public.lawyer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Yeni kullanıcı kaydında otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );

  -- Avukatsa lawyer_profiles tablosuna da ekle
  IF NEW.raw_user_meta_data->>'role' = 'lawyer' THEN
    INSERT INTO public.lawyer_profiles (id, bar_association, city, specialties, experience, phone, about, consultation_fee, languages, title)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->'lawyerProfile'->>'barAssociation', ''),
      COALESCE(NEW.raw_user_meta_data->'lawyerProfile'->>'city', ''),
      COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'lawyerProfile'->'specialties')),
        ARRAY['diger']
      ),
      COALESCE((NEW.raw_user_meta_data->'lawyerProfile'->>'experience')::INTEGER, 0),
      COALESCE(NEW.raw_user_meta_data->'lawyerProfile'->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->'lawyerProfile'->>'about', ''),
      COALESCE(NEW.raw_user_meta_data->'lawyerProfile'->>'consultationFee', 'Belirtilmemiş'),
      COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'lawyerProfile'->'languages')),
        ARRAY['Türkçe']
      ),
      COALESCE(NEW.raw_user_meta_data->'lawyerProfile'->>'title', 'Avukat')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Avukat review sonrası rating güncelle
CREATE OR REPLACE FUNCTION update_lawyer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.lawyer_profiles
  SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.lawyer_reviews WHERE lawyer_id = NEW.lawyer_id),
    review_count = (SELECT COUNT(*) FROM public.lawyer_reviews WHERE lawyer_id = NEW.lawyer_id)
  WHERE id = NEW.lawyer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE ON public.lawyer_reviews
  FOR EACH ROW EXECUTE FUNCTION update_lawyer_rating();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: herkes okuyabilir, sadece kendi profilini düzenleyebilir
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Lawyer profiles: herkes okuyabilir, sadece avukat kendi profilini düzenleyebilir
CREATE POLICY "Lawyer profiles are viewable by everyone" ON public.lawyer_profiles FOR SELECT USING (true);
CREATE POLICY "Lawyers can update own profile" ON public.lawyer_profiles FOR UPDATE USING (auth.uid() = id);

-- Cases: sadece sahibi görebilir ve düzenleyebilir
CREATE POLICY "Users can view own cases" ON public.cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON public.cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON public.cases FOR DELETE USING (auth.uid() = user_id);

-- Evidences: dava sahibi görebilir
CREATE POLICY "Users can view own evidences" ON public.evidences FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = evidences.case_id AND cases.user_id = auth.uid()));
CREATE POLICY "Users can insert own evidences" ON public.evidences FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = evidences.case_id AND cases.user_id = auth.uid()));

-- Reviews: herkes okuyabilir, müvekkil yazabilir
CREATE POLICY "Reviews are viewable by everyone" ON public.lawyer_reviews FOR SELECT USING (true);
CREATE POLICY "Clients can write reviews" ON public.lawyer_reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
