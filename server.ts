import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Helper for lazy Gemini initialization
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
      return null;
    }
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
    res.json({
      status: "ok",
      app: "Prompt2App",
      demoMode: !hasKey,
      aiAvailable: hasKey,
      timestamp: new Date().toISOString()
    });
  });

  // Generate App API route
  app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;
    const promptText = (prompt || "").trim();

    const client = getGeminiClient();

    // If Gemini key is available, we can augment with model analysis
    let aiEnhancement = null;
    if (client) {
      try {
        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `The user gave the following prompt to build an app in Prompt2App: "${promptText}".
Analyze this prompt and return a short JSON with recommended calculator configurations:
{
  "theme": one of ["slate", "zinc", "emerald", "indigo", "amber", "rose"],
  "appName": short descriptive name for the app (e.g. "Smart Calc", "Precision Calculator"),
  "defaultDark": boolean,
  "features": list of key requested features detected,
  "summary": one line description in Hindi or English matching user language
}`,
          config: {
            responseMimeType: "application/json",
          }
        });
        if (response.text) {
          try {
            aiEnhancement = JSON.parse(response.text);
          } catch {
            // fallback
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed or rate-limited; falling back to demo engine:", err);
      }
    }

    // Return generator specs
    res.json({
      success: true,
      mode: client && aiEnhancement ? "ai-powered" : "free-demo",
      enhancement: aiEnhancement,
      timestamp: new Date().toISOString()
    });
  });

  // Modify App API route
  app.post("/api/modify", async (req, res) => {
    const { currentConfig, modificationPrompt } = req.body;
    const client = getGeminiClient();

    let suggestions = null;
    if (client) {
      try {
        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Current app config: ${JSON.stringify(currentConfig)}. User modification request: "${modificationPrompt}".
Suggest updated config settings as JSON:
{
  "theme": "slate"|"zinc"|"emerald"|"indigo"|"amber"|"rose",
  "darkMode": boolean,
  "showScientific": boolean,
  "showHistory": boolean,
  "soundEnabled": boolean,
  "precision": number,
  "title": string,
  "changeLog": string
}`,
          config: {
            responseMimeType: "application/json",
          }
        });
        if (response.text) {
          try {
            suggestions = JSON.parse(response.text);
          } catch {
            // fallback
          }
        }
      } catch (err) {
        console.warn("Gemini API modify failed, fallback to demo mode logic:", err);
      }
    }

    res.json({
      success: true,
      mode: client && suggestions ? "ai-powered" : "free-demo",
      suggestions,
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Prompt2App server running on port ${PORT}`);
  });
}

startServer();
