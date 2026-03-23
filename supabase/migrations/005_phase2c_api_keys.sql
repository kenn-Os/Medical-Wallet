-- Phase 2C: Clinical Ecosystem API Keys
CREATE TABLE IF NOT EXISTS institution_api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{read}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

ALTER TABLE institution_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own API keys"
  ON institution_api_keys FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can select API keys for auth"
  ON institution_api_keys FOR SELECT
  USING (auth.role() = 'service_role');
