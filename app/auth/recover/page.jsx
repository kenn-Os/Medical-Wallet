'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function RecoverPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing your request...');

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Handle PKCE code in query params (comes from some Supabase flows)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          router.replace('/reset-password-update');
        } else {
          router.replace('/auth/auth-code-error?reason=' + encodeURIComponent(error.message));
        }
      });
      return;
    }

    // Handle implicit flow: access_token in URL hash fragment
    // Supabase JS automatically reads the hash and fires onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('Link verified! Redirecting...');
        router.replace('/reset-password-update');
      } else if (event === 'SIGNED_IN' && session) {
        // Signed in via recovery token
        setStatus('Link verified! Redirecting...');
        router.replace('/reset-password-update');
      } else if (event === 'TOKEN_REFRESHED') {
        router.replace('/reset-password-update');
      }
    });

    // Fallback: if nothing happens in 8 seconds, show error
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
