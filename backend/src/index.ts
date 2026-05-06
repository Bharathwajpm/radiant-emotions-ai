import dotenv from "dotenv";
dotenv.config();

import cors from "cors";

import express from "express";
import OpenAI from "openai";
import { createUser, getBearerToken, getUserByEmail, issueAccessToken, verifyAccessToken, verifyUser } from "./auth.js";
import { connectToMongo, getMongoLastError, isMongoConnected } from "./db.js";
import mongoose from "mongoose";
import { MoodEntryModel } from "./models/MoodEntry.js";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:8081,http://localhost:8080")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (no Origin header), then enforce allowlist for browser clients.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

await connectToMongo();

const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    mongo: {
      connected: isMongoConnected(),
      error: getMongoLastError(),
    },
  });
});

app.get("/", (_req, res) => {
  res.type("text").send("Radiant Emotions API is running.");
});

app.post("/auth/signup", async (req, res) => {
  if (!isMongoConnected()) return res.status(503).json({ ok: false, error: "MongoDB is not connected." });

  const email = req.body?.email;
  const password = req.body?.password;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      ok: false,
      error: "Invalid request body. Expected JSON: { email: string, password: string }",
    });
  }

  try {
    const created = await createUser(email, password);
    if (!created.ok) {
      const status = created.error === "Email already registered." ? 409 : 400;
      return res.status(status).json({ ok: false, error: created.error });
    }

    const token = issueAccessToken(created.user);
    return res.json({
      ok: true,
      token,
      user: { id: created.user.id, email: created.user.email, createdAt: created.user.createdAt },
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Signup failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  if (!isMongoConnected()) return res.status(503).json({ ok: false, error: "MongoDB is not connected." });

  const email = req.body?.email;
  const password = req.body?.password;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      ok: false,
      error: "Invalid request body. Expected JSON: { email: string, password: string }",
    });
  }

  try {
    const verified = await verifyUser(email, password);
    if (!verified.ok) {
      return res.status(401).json({ ok: false, error: verified.error });
    }

    const token = issueAccessToken(verified.user);
    return res.json({
      ok: true,
      token,
      user: { id: verified.user.id, email: verified.user.email, createdAt: verified.user.createdAt },
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Login failed" });
  }
});

app.get("/me", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ ok: false, error: "Missing Bearer token." });
  if (!isMongoConnected()) return res.status(503).json({ ok: false, error: "MongoDB is not connected." });

  try {
    const claims = verifyAccessToken(token);
    const user = await getUserByEmail(claims.email);
    if (!user) return res.status(401).json({ ok: false, error: "User not found." });
    return res.json({
      ok: true,
      user: { id: String(user._id), email: user.email, createdAt: new Date(user.createdAt).toISOString() },
    });
  } catch (e) {
    return res.status(401).json({ ok: false, error: e instanceof Error ? e.message : "Invalid token." });
  }
});

function requireAuth(req: express.Request) {
  const token = getBearerToken(req);
  if (!token) return { ok: false as const, status: 401, error: "Missing Bearer token." };
  try {
    const claims = verifyAccessToken(token);
    return { ok: true as const, claims };
  } catch (e) {
    return { ok: false as const, status: 401, error: e instanceof Error ? e.message : "Invalid token." };
  }
}

app.post("/moods", async (req, res) => {
  const auth = requireAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });
  if (!isMongoConnected()) return res.status(503).json({ ok: false, error: "MongoDB is not connected." });

  const label = req.body?.label;
  const emoji = req.body?.emoji;
  const score = req.body?.score;
  const note = req.body?.note;

  if (typeof label !== "string" || label.trim().length === 0) {
    return res.status(400).json({ ok: false, error: "Invalid body. Expected { label: string, emoji?: string, score?: number, note?: string }" });
  }
  if (emoji !== undefined && typeof emoji !== "string") {
    return res.status(400).json({ ok: false, error: "emoji must be a string" });
  }
  if (score !== undefined && (typeof score !== "number" || Number.isNaN(score) || score < 0 || score > 10)) {
    return res.status(400).json({ ok: false, error: "score must be a number between 0 and 10" });
  }
  if (note !== undefined && typeof note !== "string") {
    return res.status(400).json({ ok: false, error: "note must be a string" });
  }

  const created = await MoodEntryModel.create({
    userId: new mongoose.Types.ObjectId(auth.claims.sub),
    label: label.trim(),
    emoji: typeof emoji === "string" ? emoji.trim() : undefined,
    score,
    note: typeof note === "string" ? note.trim() : undefined,
  });

  return res.json({
    ok: true,
    moodEntry: {
      id: String(created._id),
      label: created.label,
      emoji: created.emoji,
      score: created.score,
      note: created.note,
      createdAt: created.createdAt.toISOString(),
    },
  });
});

app.get("/moods/summary", async (req, res) => {
  const auth = requireAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });
  if (!isMongoConnected()) return res.status(503).json({ ok: false, error: "MongoDB is not connected." });

  const days = Math.min(Math.max(Number(req.query.days ?? 7), 1), 30);
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const userId = new mongoose.Types.ObjectId(auth.claims.sub);
  const entries = await MoodEntryModel.find({ userId, createdAt: { $gte: since } })
    .sort({ createdAt: 1 })
    .lean();

  const dayKeys: { key: string; label: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    dayKeys.push({ key, label });
  }

  // Average score per day (fallback to label->score mapping if score missing)
  const labelScore: Record<string, number> = { Great: 8, Okay: 6, Meh: 5, Low: 3, Upset: 2, Calm: 7, Happy: 8, Anxious: 4, Sad: 3, Stressed: 3, Tired: 4, Lonely: 3 };
  const scoresByDay = new Map<string, number[]>();
  const countsByLabel = new Map<string, number>();

  for (const e of entries) {
    const createdAt = new Date(e.createdAt as any);
    const dayKey = createdAt.toISOString().slice(0, 10);
    const score = typeof (e as any).score === "number" ? (e as any).score : (labelScore[String((e as any).label)] ?? 5);
    const arr = scoresByDay.get(dayKey) ?? [];
    arr.push(score);
    scoresByDay.set(dayKey, arr);

    const lbl = String((e as any).label);
    countsByLabel.set(lbl, (countsByLabel.get(lbl) ?? 0) + 1);
  }

  const moodOverTime = dayKeys.map(({ key, label }) => {
    const scores = scoresByDay.get(key) ?? [];
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    return { day: label, mood: avg === null ? null : Math.round(avg * 10) / 10 };
  });

  const emotionSummary = Array.from(countsByLabel.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Today's mood (latest entry)
  const latest = entries.length ? entries[entries.length - 1] : null;
  const todayMood = latest
    ? {
        label: String((latest as any).label),
        emoji: (latest as any).emoji ? String((latest as any).emoji) : null,
        score: typeof (latest as any).score === "number" ? (latest as any).score : null,
      }
    : null;

  // Simple trend: compare last 3 days vs previous 3 days
  const numeric = moodOverTime.map((d) => d.mood).filter((v): v is number => typeof v === "number");
  let weeklyTrendPercent: number | null = null;
  if (numeric.length >= 6) {
    const last3 = numeric.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const prev3 = numeric.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    weeklyTrendPercent = prev3 === 0 ? null : Math.round(((last3 - prev3) / prev3) * 100);
  }

  return res.json({
    ok: true,
    days,
    todayMood,
    weeklyTrendPercent,
    moodOverTime,
    emotionSummary,
  });
});

function generateAiLikeReply(message: string) {
  const t = message.toLowerCase();
  if (/(stress|overwhelm|pressure)/.test(t)) {
    return "I hear you. Stress can feel heavy. Try one slow breath: inhale 4, hold 2, exhale 6. What’s the biggest source of pressure right now?";
  }
  if (/(anxi|worri|nervous|panic)/.test(t)) {
    return "That sounds really uncomfortable. Let’s ground for a moment: name 5 things you can see and 4 things you can touch. What’s your mind predicting will happen?";
  }
  if (/(sad|down|depress|cry|unhappy)/.test(t)) {
    return "I’m sorry you’re feeling low. You don’t have to carry it alone. What happened today that felt the hardest?";
  }
  if (/(lonely|alone|isolat)/.test(t)) {
    return "Loneliness can be intense. I’m here with you. Would you like to talk about what you wish you had support with right now?";
  }
  if (/(tired|exhaust|sleep|fatigu)/.test(t)) {
    return "That sounds exhausting. If you could take a tiny break in the next hour, what would feel most restorative—water, a stretch, or a few quiet minutes?";
  }
  if (/(happy|great|good|joy|excited|amazing)/.test(t)) {
    return "I love hearing that. Let’s hold onto it—what made today feel a little brighter, and how can we repeat it this week?";
  }
  return "Thanks for sharing that with me. Tell me a bit more—what are you feeling most strongly right now, and where do you notice it in your body?";
}

async function generateSupportiveReplyWithOpenAI(message: string) {
  if (!openai) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const system = [
    "You are a supportive mental health companion.",
    "Be warm, non-judgmental, and practical.",
    "Do NOT claim to be a therapist/doctor or provide medical diagnosis.",
    "Avoid giving harmful instructions. Encourage seeking professional help when appropriate.",
    "If the user mentions self-harm, suicide, or immediate danger, encourage contacting local emergency services or a crisis hotline and reaching out to a trusted person, and keep the response brief and supportive.",
    "Keep responses concise (4-8 sentences). Ask one gentle follow-up question.",
  ].join(" ");

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: message },
    ],
    temperature: 0.7,
    max_tokens: 220,
  });

  const text = completion.choices?.[0]?.message?.content?.trim();
  return text && text.length > 0 ? text : null;
}

app.post("/chat", async (req, res) => {
  const message = req.body?.message;

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      error: "Invalid request body. Expected JSON: { message: string }",
    });
  }

  const userMessage = message.trim();

  try {
    const aiReply = await generateSupportiveReplyWithOpenAI(userMessage);
    const reply = aiReply ?? generateAiLikeReply(userMessage);

    return res.json({
      ok: true,
      reply,
      received: userMessage,
      replySource: aiReply ? "openai" : "fallback",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    const reply = generateAiLikeReply(userMessage);
    return res.json({
      ok: true,
      reply,
      received: userMessage,
      replySource: "fallback",
      warning: e instanceof Error ? e.message : "OpenAI request failed",
      timestamp: new Date().toISOString(),
    });
  }
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

