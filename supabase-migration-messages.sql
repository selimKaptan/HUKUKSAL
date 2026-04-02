-- =============================================
-- JusticeGuard - Messages & Lawyer Verification Migration
-- Supabase SQL Editor'de çalıştırın
-- =============================================

-- =============================================
-- 1. CONVERSATIONS (Mesajlaşma konuşmaları)
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  case_title TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  UNIQUE(client_id, lawyer_id)
);

-- =============================================
-- 2. MESSAGES (Mesajlar)
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL
);

-- =============================================
-- 3. LAWYER VERIFICATION FIELDS
-- =============================================
ALTER TABLE public.lawyer_profiles
  ADD COLUMN IF NOT EXISTS baro_sicil_no TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verification_note TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_conversations_client ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lawyer ON public.conversations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);
CREATE INDEX IF NOT EXISTS idx_lawyer_verification ON public.lawyer_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_lawyer_baro_sicil ON public.lawyer_profiles(baro_sicil_no);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Mesaj gönderildiğinde conversation'ı güncelle
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message = NEW.content,
    last_message_time = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conv_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations: sadece katılımcılar görebilir
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = lawyer_id);
CREATE POLICY "Clients can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = lawyer_id);

-- Messages: sadece konuşma katılımcıları görebilir
CREATE POLICY "Users can view conversation messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.lawyer_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.lawyer_id = auth.uid())
    )
  );
CREATE POLICY "Users can mark messages as read" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.lawyer_id = auth.uid())
    )
  );
