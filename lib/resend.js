import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey || resendApiKey === 're_placeholder_key') {
  console.warn("⚠️ RESEND_API_KEY is missing or using a placeholder. Emails will not be sent.");
}

export const resend = new Resend(resendApiKey && resendApiKey !== 're_placeholder_key' ? resendApiKey : 'invalid_key');
