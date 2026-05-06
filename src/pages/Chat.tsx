import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useSearchParams } from "react-router-dom";

type Mood = { label: string; emoji: string; color: string };

type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
  mood?: Mood;
  status?: "error";
};

const quickPrompts = [
  { text: "I feel stressed", emoji: "😣" },
  { text: "I feel anxious", emoji: "😟" },
  { text: "I feel happy", emoji: "😊" },
  { text: "I feel lonely", emoji: "🥺" },
  { text: "I feel tired", emoji: "😴" },
];

const moodMap: Record<string, Mood> = {
  stressed: { label: "Stressed", emoji: "😣", color: "from-orange-300/40 to-primary/10" },
  anxious: { label: "Anxious", emoji: "😟", color: "from-yellow-300/40 to-primary/10" },
  sad: { label: "Sad", emoji: "😔", color: "from-blue-300/40 to-primary/10" },
  lonely: { label: "Lonely", emoji: "🥺", color: "from-indigo-300/40 to-primary/10" },
  tired: { label: "Tired", emoji: "😴", color: "from-purple-300/40 to-primary/10" },
  happy: { label: "Happy", emoji: "😊", color: "from-green-300/40 to-accent/30" },
  calm: { label: "Calm", emoji: "🌿", color: "from-emerald-300/40 to-accent/30" },
};

function detectMood(text: string): Mood {
  const t = text.toLowerCase();
  if (/(stress|overwhelm|pressure)/.test(t)) return moodMap.stressed;
  if (/(anxi|worri|nervous|panic)/.test(t)) return moodMap.anxious;
  if (/(sad|down|depress|cry|unhappy)/.test(t)) return moodMap.sad;
  if (/(lonely|alone|isolat)/.test(t)) return moodMap.lonely;
  if (/(tired|exhaust|sleep|fatigu)/.test(t)) return moodMap.tired;
  if (/(happy|great|good|joy|excited|amazing)/.test(t)) return moodMap.happy;
  return moodMap.calm;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      text: "Hi there 🌸 I'm your mindful companion. Take your time — how are you feeling today?",
      mood: moodMap.calm,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const pendingPrompt = useMemo(() => searchParams.get("prompt"), [searchParams]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (typing) return;
    const mood = detectMood(trimmed);
    const userMsg: Message = { id: Date.now(), role: "user", text: trimmed, mood };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setError(null);

    try {
      const data = (await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      })) as any;

      const replyText = typeof data?.reply === "string" ? data.reply : "I’m here with you. Could you say a bit more?";
      setMessages((m) => [...m, { id: Date.now() + 1, role: "ai", text: replyText, mood }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to reach chat service";
      setError(msg);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "ai",
          text: "I couldn’t reach the server just now. Please try again in a moment.",
          mood,
          status: "error",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => {
    if (!pendingPrompt) return;
    // consume query param once
    setSearchParams((sp) => {
      const next = new URLSearchParams(sp);
      next.delete("prompt");
      return next;
    });
    // fire and forget
    send(pendingPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  return (
    <div className="container py-6 md:py-10 max-w-4xl">
      <div className="rounded-3xl glass border border-border/60 shadow-card overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border/50 bg-gradient-mood">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display font-semibold leading-tight">Mindful Companion</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Listening with care
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Private & encrypted
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 border-b border-border/40 bg-destructive/10 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}
              >
                {m.role === "user" && m.mood && (
                  <div className="text-[11px] text-muted-foreground mr-1">
                    Detected mood: <span className="font-medium text-foreground">{m.mood.emoji} {m.mood.label}</span>
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card",
                    m.role === "user"
                      ? "bg-gradient-primary text-primary-foreground rounded-br-sm"
                      : cn(
                          "bg-card border border-border/60 rounded-bl-sm",
                          m.status === "error" && "border-destructive/30 bg-destructive/10"
                        )
                  )}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}

            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start"
              >
                <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-typing" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-typing" style={{ animationDelay: "0.15s" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-typing" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick prompts */}
        <div className="px-4 pt-3 pb-2 border-t border-border/40 flex flex-wrap gap-2">
          {quickPrompts.map((q) => (
            <button
              key={q.text}
              onClick={() => send(`${q.text} ${q.emoji}`)}
              disabled={typing}
              className="text-xs rounded-full bg-muted/70 hover:bg-muted px-3 py-1.5 transition-smooth border border-border/40"
            >
              {q.text} {q.emoji}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-3 border-t border-border/50 bg-card/50 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How are you feeling today?"
            className="flex-1 bg-muted/50 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-smooth border border-transparent focus:border-primary/40"
            disabled={typing}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-full bg-gradient-primary shadow-soft hover:opacity-90"
            aria-label="Send"
            disabled={typing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
