import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const { profile, allergies, medications, conditions } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is missing. Please add it to your environment variables." },
        { status: 500 }
      );
    }

    const analyzeData = async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
        You are a specialized medical health data analyst. 
        Analyze the following patient data from their digital health wallet:
        
        Patient Profile: ${JSON.stringify(profile)}
        Allergies: ${JSON.stringify(allergies)}
        Medications: ${JSON.stringify(medications)}
        Conditions: ${JSON.stringify(conditions)}

        Based ONLY on this data, generate exactly 3-4 personalized health insights.
        Each insight must follow this JSON structure:
        {
          "title": "Short title",
          "desc": "Actionable, friendly description",
          "type": "one of: 'info', 'warning', 'danger', 'success'",
          "icon": "one of: 'Heart', 'AlertCircle', 'CheckCircle2', 'Pill', 'Activity', 'Brain'"
        }

        Return ONLY a JSON array. No markdown, no prose.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(jsonStr);
    };

    // Try multiple models in order of preference to find one with quota
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-2.0-flash-exp"];
    let insights;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Analyzing with ${modelName}...`);
        insights = await analyzeData(modelName);
        if (insights) break;
      } catch (err) {
        lastError = err;
        console.warn(`${modelName} failed:`, err.message);
      }
    }

    if (!insights) {
      throw lastError || new Error("All available AI models failed to process the request.");
    }

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("AI Analysis Error:", err);
    return NextResponse.json({ 
      error: "Failed to generate health insights.",
      details: err.message || String(err)
    }, { status: 500 });
  }
}
