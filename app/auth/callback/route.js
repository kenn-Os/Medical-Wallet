import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Supabase may redirect with an error directly (e.g. redirect URL not allowlisted)
  const supabaseError = searchParams.get("error");
  const supabaseErrorDescription = searchParams.get("error_description");
  if (supabaseError) {
    console.error("Supabase redirected with error:", supabaseError, supabaseErrorDescription);
    const params = new URLSearchParams({ reason: supabaseErrorDescription || supabaseError });
    return NextResponse.redirect(`${origin}/auth/auth-code-error?${params}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Auth callback error during code exchange:", error.message, error.status);
    const params = new URLSearchParams({ reason: error.message });
    return NextResponse.redirect(`${origin}/auth/auth-code-error?${params}`);
  }

  // No code and no error — something unexpected
  console.error("Auth callback reached with no code and no error param. URL:", request.url);
  const params = new URLSearchParams({ reason: "No authorization code was received. The link may be malformed." });
  return NextResponse.redirect(`${origin}/auth/auth-code-error?${params}`);
}
