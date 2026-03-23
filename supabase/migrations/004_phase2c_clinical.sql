-- Phase 2C: Clinical Ecosystem

-- 1. Create the RPC for verifying doctor access tokens
CREATE OR REPLACE FUNCTION verify_doctor_access(
  p_health_id TEXT,
  p_token TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_token_record RECORD;
BEGIN
  -- Find the user ID by universal_health_id
  SELECT user_id INTO v_user_id FROM public.profiles WHERE universal_health_id = p_health_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid Universal Health ID';
  END IF;

  -- Verify the token
  SELECT * INTO v_token_record FROM public.doctor_access_tokens 
  WHERE user_id = v_user_id AND token = p_token AND is_active = true AND expires_at > NOW();

  IF v_token_record IS NULL THEN
    RAISE EXCEPTION 'Invalid, expired, or revoked access token';
  END IF;

  -- Log the access automatically!
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    user_agent,
    metadata
  )
  VALUES (
    v_user_id,
    'Patient Record Accessed via Clinical Portal',
    'clinical_access',
    v_token_record.id,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent',
    jsonb_build_object('doctor_name', v_token_record.doctor_name, 'doctor_email', v_token_record.doctor_email)
  );

  RETURN v_user_id;
END;
$$;
