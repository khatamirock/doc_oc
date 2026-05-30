import express from "express";
import { GoogleGenAI } from "@google/genai";
import { CLINICAL_SYSTEM_PROMPT } from "./server/prompt.js";

// Helper to get GoogleGenAI client with optional custom API key from client header/body
function getAIClient(req: express.Request) {
  let customApiKey = (req.headers["x-api-key"] as string) || (req.body && req.body.apiKey);
  if (customApiKey === "undefined" || customApiKey === "null") {
    customApiKey = "";
  }
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the web interface settings.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Create an exportable Express router/app for Vercel Serverless capability
export const apiApp = express();
apiApp.use(express.json());

// API Route - Get current server configurations
apiApp.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    defaultModel: "gemini-3.5-flash",
  });
});

// API Route - Synchronous Chat (Fallback)
apiApp.post("/api/chat-sync", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const clientAi = getAIClient(req);
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await clientAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: CLINICAL_SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Error in /api/chat-sync:", err);
    res.status(500).json({ error: err.message || "Failed to communicate with Gemini." });
  }
});

// API Route - Real-time Streaming Chat (SSE)
apiApp.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const clientAi = getAIClient(req);

    // Configure Event Stream headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const responseStream = await clientAi.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: CLINICAL_SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Error in /api/chat stream:", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "An unexpected error occurred during streaming." })}\n\n`);
    res.end();
  }
});
