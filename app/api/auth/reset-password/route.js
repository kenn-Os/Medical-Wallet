import { createAdminClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/plunk";
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

    // Generate the reset password link
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

    const resetLink = data.properties.action_link;

    // Send the email via Plunk
    const emailResponse = await sendEmail({
      to: email,
      subject: "Reset Your Password - Medical Wallet",
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>We received a request to reset your password for your Medical Wallet account.</p>
          <p>Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Medical Wallet securely manages your health records.</p>
        </div>
      `,
    });

    if (!emailResponse.success) {
      console.error("Error sending email via Plunk:", emailResponse.error);
      return NextResponse.json(
        { error: `Failed to send reset email via Plunk: ${emailResponse.error}` },
        { status: 500 }
      );
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
