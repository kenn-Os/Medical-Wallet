-- ============================================================
-- Phase 2A Schema Additions: Core Identity & Data Expansion
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add Universal Health ID to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS universal_health_id TEXT UNIQUE;

-- Modify auto-creation trigger to generate an ID
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_health_id TEXT;
BEGIN
  -- Generate a friendly ID: MW- + 8 characters of the user's UUID
  new_health_id := 'MW-' || upper(substring(replace(NEW.id::text, '-', '') from 1 for 8));

  INSERT INTO public.profiles (user_id, full_name, blood_type, universal_health_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'Unknown',
    new_health_id
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users with a Health ID if they don't have one
UPDATE public.profiles
SET universal_health_id = 'MW-' || upper(substring(replace(user_id::text, '-', '') from 1 for 8))
WHERE universal_health_id IS NULL;


-- 2. Create Insurance Cards Table
CREATE TABLE IF NOT EXISTS public.insurance_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  group_number TEXT,
  card_type TEXT DEFAULT 'medical' CHECK (card_type IN ('medical', 'dental', 'vision', 'other')),
  primary_member_name TEXT,
  valid_from DATE,
  valid_until DATE,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.insurance_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own insurance" ON public.insurance_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own insurance" ON public.insurance_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own insurance" ON public.insurance_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own insurance" ON public.insurance_cards FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_insurance_cards_updated_at ON public.insurance_cards;
CREATE TRIGGER update_insurance_cards_updated_at BEFORE UPDATE ON public.insurance_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 3. Create Lab Results Table
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  category TEXT,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  reference_range TEXT,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'high', 'low', 'critical')),
  test_date DATE,
  lab_name TEXT,
  verified_status TEXT DEFAULT 'user_added' CHECK (verified_status IN ('user_added', 'doctor_verified', 'institution_verified')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own labs" ON public.lab_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own labs" ON public.lab_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own labs" ON public.lab_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own labs" ON public.lab_results FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_lab_results_updated_at ON public.lab_results;
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON public.lab_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
