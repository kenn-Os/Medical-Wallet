-- ============================================================
-- MedWallet Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  phone TEXT,
  address TEXT,
  blood_type TEXT DEFAULT 'Unknown',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all profiles"
  ON profiles FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- ALLERGIES
-- ============================================================
CREATE TABLE IF NOT EXISTS allergies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  allergen TEXT NOT NULL,
  reaction TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  verified_status TEXT DEFAULT 'user_added' CHECK (verified_status IN ('user_added', 'doctor_verified', 'institution_verified')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own allergies" ON allergies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own allergies" ON allergies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own allergies" ON allergies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own allergies" ON allergies FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role reads all allergies"
  ON allergies FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- MEDICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  prescribing_doctor TEXT,
  is_current BOOLEAN DEFAULT true,
  verified_status TEXT DEFAULT 'user_added' CHECK (verified_status IN ('user_added', 'doctor_verified', 'institution_verified')),
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own medications" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own medications" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own medications" ON medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own medications" ON medications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role reads all medications"
  ON medications FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- CONDITIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conditions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  diagnosed_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'managed')),
  icd_code TEXT,
  verified_status TEXT DEFAULT 'user_added' CHECK (verified_status IN ('user_added', 'doctor_verified', 'institution_verified')),
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own conditions" ON conditions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conditions" ON conditions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conditions" ON conditions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own conditions" ON conditions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role reads all conditions"
  ON conditions FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- SURGERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS surgeries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  procedure_name TEXT NOT NULL,
  date DATE,
  hospital TEXT,
  surgeon TEXT,
  outcome TEXT,
  verified_status TEXT DEFAULT 'user_added' CHECK (verified_status IN ('user_added', 'doctor_verified', 'institution_verified')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE surgeries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own surgeries" ON surgeries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own surgeries" ON surgeries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own surgeries" ON surgeries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own surgeries" ON surgeries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role reads all surgeries"
  ON surgeries FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- VACCINATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vaccine_name TEXT NOT NULL,
  date_administered DATE,
  dose_number INTEGER,
  administered_by TEXT,
  lot_number TEXT,
  next_due_date DATE,
  verified_status TEXT DEFAULT 'user_added' CHECK (verified_status IN ('user_added', 'doctor_verified', 'institution_verified')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vaccinations" ON vaccinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vaccinations" ON vaccinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vaccinations" ON vaccinations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own vaccinations" ON vaccinations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role reads all vaccinations"
  ON vaccinations FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT DEFAULT 'other' CHECK (document_type IN ('lab_result', 'prescription', 'discharge_note', 'diagnostic_report', 'other')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT 'application/pdf',
  storage_url TEXT,
  verified_status TEXT DEFAULT 'user_added' CHECK (verified_status IN ('user_added', 'doctor_verified', 'institution_verified')),
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own documents"
  ON documents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role reads all documents"
  ON documents FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- DOCTOR ACCESS TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_access_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  doctor_name TEXT,
  doctor_email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE doctor_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tokens"
  ON doctor_access_tokens FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role reads all tokens"
  ON doctor_access_tokens FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role updates tokens"
  ON doctor_access_tokens FOR UPDATE USING (auth.role() = 'service_role');

-- ============================================================
-- DOCTOR PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  specialization TEXT,
  hospital_affiliation TEXT,
  country TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own profile"
  ON doctor_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "All can view verified doctors"
  ON doctor_profiles FOR SELECT USING (verified = true);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages audit logs"
  ON audit_logs FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run in Supabase Dashboard > Storage > New Bucket: "medical-documents"
-- Or via API:
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- AUTO PROFILE CREATION TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, blood_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'Unknown'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_allergies_updated_at BEFORE UPDATE ON allergies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_conditions_updated_at BEFORE UPDATE ON conditions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_surgeries_updated_at BEFORE UPDATE ON surgeries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON vaccinations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
