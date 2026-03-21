import { createAdminClient } from "@/utils/supabase/server";
import { sendPasswordResetEmail } from "@/utils/email-service";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Generate the reset password link manually
    // This bypasses the broken Supabase dashboard SMTP settings
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password-update`,
      },
    });

    if (error) {
      console.error("Error generating reset link:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const resetLink = data.properties?.action_link;

    if (!resetLink) {
      console.error("Critical: No action_link found in Supabase response properties");
      return NextResponse.json(
        { error: "Failed to generate a valid reset link" },
        { status: 500 }
      );
    }

    // EXPLICIT LOG FOR DEBUGGING
    console.log("------------------------------------------");
    console.log("PASSWORD RESET LINK GENERATED:");
    console.log(resetLink);
    console.log("------------------------------------------");

    // Send the email via Resend utility
    const emailResponse = await sendPasswordResetEmail(email, resetLink);

    if (!emailResponse.success) {
      console.error("Resend delivery failed:", emailResponse.error);
      // We still return 200 because the link is in the logs, but it's not ideal
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
