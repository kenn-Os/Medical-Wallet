'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

export default function RecoverPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing your request...');

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Standard client: can detect implicit-flow hash tokens (#access_token=...)
    const supabaseStandard = createClient(supabaseUrl, supabaseKey);
    // SSR client: stores session in cookies so the reset page can read it
    const supabaseSSR = createBrowserClient(supabaseUrl, supabaseKey);

    async function bridgeSession(accessToken, refreshToken) {
      // Write the session to cookies via the SSR client
      const { error } = await supabaseSSR.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.error('[Recover] Failed to bridge session to cookies:', error.message);
        router.replace('/auth/auth-code-error?reason=' + encodeURIComponent(error.message));
        return;
      }
      setStatus('Link verified! Redirecting...');
      router.replace('/reset-password-update');
    }

    // Handle PKCE code from query params (some Supabase configurations)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      supabaseStandard.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          router.replace('/auth/auth-code-error?reason=' + encodeURIComponent(error.message));
        } else {
          bridgeSession(data.session.access_token, data.session.refresh_token);
        }
      });
      return;
    }

    // Handle implicit flow: detect PASSWORD_RECOVERY event from hash token
    const { data: { subscription } } = supabaseStandard.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setStatus('Link verified! Bridging session...');
        bridgeSession(session.access_token, session.refresh_token);
      }
    });

    // Fallback timeout
    const timeout = setTimeout(() => {
      router.replace('/auth/auth-code-error?reason=' + encodeURIComponent('Link could not be verified. It may have expired or already been used.'));
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-700 font-medium">{status}</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}
