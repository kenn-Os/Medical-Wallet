import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/plunk";

export async function POST(request) {
  try {
    const { email, subject, body } = await request.json();

    if (!email || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: email, subject, body" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: subject,
      body: body,
    });

    if (result.success) {
      return NextResponse.json({ message: "Email sent successfully", data: result.data });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
