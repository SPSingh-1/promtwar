import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static assets from dist
app.use(express.static(path.join(__dirname, "dist")));

// Initialize Google Gen AI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// API endpoint for deep mental insights
app.post("/api/insights", async (req: Request, res: Response) => {
  try {
    const { entries, examType, daysToExam } = req.body;

    if (!entries || !Array.isArray(entries)) {
      res.status(400).json({ error: "Missing or invalid entries." });
      return;
    }

    if (!ai || !apiKey) {
      // Fallback mode if API key is not configured, to ensure app doesn't crash
      res.json({
        overallAssessment: "Aura is currently running in offline rule-based mode. Please configure a GEMINI_API_KEY in the environment to unlock personalized deep AI insights.",
        copingStrategies: [
          {
            title: "Connect to Google AI Studio",
            description: "Add a GEMINI_API_KEY to your environment variables to enable dynamic, personalized mental health counseling powered by Gemini.",
            actionText: "Do Breathing Exercise"
          }
        ],
        burnoutWarning: null
      });
      return;
    }

    // Format logs for the prompt
    const formattedLogs = entries.map((e: any) => {
      return `- Date: ${new Date(e.timestamp).toLocaleDateString()}, Mood: ${e.mood}, Intensity: ${e.intensity}/10, Triggers: ${(e.triggers || []).join(", ") || "None"}, Note: "${e.note || "No diary note."}"`;
    }).join("\n");

    const prompt = `You are Aura, an empathetic, expert AI counselor supporting an Indian student preparing for a high-stakes exam (${examType}).
The exam is in ${daysToExam} days.
Here are the student's recent wellness check-in entries (most recent first):
${formattedLogs}

Analyze these entries for mental health patterns, stress triggers, and signs of burnout.
Provide a highly personalized, warm, encouraging, and culturally-aware diagnostic report.
You must return the response strictly as a JSON object matching this structure:
{
  "overallAssessment": "A brief, highly empathetic 2-3 sentence summary of how they are doing and validation of their feelings.",
  "copingStrategies": [
    {
      "title": "Strategy Title",
      "description": "Short, concrete advice specifically addressing their biggest stressor or mood pattern.",
      "actionText": "Short action label (e.g., Do Breathing Exercise)"
    },
    {
      "title": "Strategy Title",
      "description": "Another specific coping strategy.",
      "actionText": "Short action label (e.g., 5-Min Guided Journal)"
    },
    {
      "title": "Strategy Title",
      "description": "A third specific coping strategy.",
      "actionText": "Short action label (e.g., Use Grounding Technique)"
    }
  ],
  "burnoutWarning": "A prominent warning string if they show high burnout/severe distress signs, otherwise null"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini API");
    }

    const insights = JSON.parse(text);
    res.json(insights);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate AI insights: " + error.message });
  }
});

// Fallback to index.html for SPA routing
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
