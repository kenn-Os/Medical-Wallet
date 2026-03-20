import Plunk from "@plunk/node";

const plunkKey = (process.env.PLUNK_SECRET_KEY || process.env.PLUNK_API_KEY)?.trim();

if (!plunkKey) {
  console.warn("Plunk API Key is not defined in environment variables (PLUNK_SECRET_KEY or PLUNK_API_KEY).");
}

export const plunk = new Plunk(plunkKey || "");

/**
 * Send an email using Plunk
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email HTML body
 * @returns {Promise<Object>}
 */
export async function sendEmail({ to, subject, body }) {
  try {
    const data = await plunk.emails.send({
      to,
      subject,
      body,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email via Plunk:", error);
    return { 
      success: false, 
      error: error.message,
      status: error.status || error.code
    };
  }
}
