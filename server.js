
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ||
    "https://rayandjibrilx-ai.github.io"
}));

app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  res.send("ARISE AI server is running.");
});

app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    const safeMessages = messages.slice(-20).filter(message =>
      message &&
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" &&
      message.content.trim().length > 0 &&
      message.content.length <= 4000
    );

    if (
      safeMessages.length === 0 ||
      safeMessages[safeMessages.length - 1].role !== "user"
    ) {
      return res.status(400).json({
        error: "Please send a valid user message."
      });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "You are ARISE AI, a helpful, friendly, and intelligent assistant. " +
        "Give clear, accurate answers. Admit when you are unsure.",
      input: safeMessages.map(message => ({
        role: message.role,
        content: message.content
      })),
      max_output_tokens: 800
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error("ARISE AI request failed:", error.message);

    res.status(500).json({
      error: "ARISE AI could not answer right now. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`ARISE AI server listening on port ${PORT}`);
});
