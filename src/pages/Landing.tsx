import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, BarChart3, Smile, Lightbulb, TrendingUp, Sparkles, ArrowRight, Heart, Leaf } from "lucide-react";
import heroImage from "@/assets/real-meditation.jpg";
import journalImage from "@/assets/real-journal.jpg";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api";

const moodOptions = [
  { emoji: "😊", label: "Great" },
  { emoji: "🙂", label: "Okay" },
  { emoji: "😐", label: "Meh" },
  { emoji: "😔", label: "Low" },
  { emoji: "😡", label: "Upset" },
];

const features = [
  {
    icon: Smile,
    emoji: "😊",
    title: "Emotion Detection",
    desc: "AI gently understands how you feel from your own words.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Lightbulb,
    emoji: "💡",
    title: "AI Suggestions",
    desc: "Personalized tips, exercises, and gentle reminders.",
    color: "from-secondary to-accent/40",
  },
  {
    icon: TrendingUp,
    emoji: "📈",
    title: "Mood Tracking",
    desc: "See your emotional journey over time, beautifully visualized.",
    color: "from-accent/60 to-primary/10",
  },
];

const Landing = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<unknown>(null);

  const testApi = async () => {
    const baseUrl = getApiBaseUrl();
    setApiLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${baseUrl}/health`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setApiResponse(data);
    } catch (e) {
      setApiResponse(null);
      setApiError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="container py-12 md:py-20">
      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-card/80 border border-border/60 px-4 py-1.5 text-sm shadow-card backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Your safe space, always open</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            AI Mental Health{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Companion
            </span>{" "}
            <span className="inline-block animate-float">🧠💙</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Talk, express, and feel better with gentle AI support. A calm place to
            understand your emotions and build healthier habits — one breath at a time.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="rounded-full bg-gradient-primary hover:opacity-90 shadow-glow text-base px-7 h-12">
              <Link to="/chat">
                Start Chat 💬 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-card/60 backdrop-blur border-border/60 text-base px-7 h-12">
              <Link to="/dashboard">Check Mood 📊</Link>
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" /> 100% private
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" /> Always gentle
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-20 rounded-full" />
          <div className="relative rounded-3xl overflow-hidden shadow-glow bg-gradient-hero p-2">
            <img
              src={heroImage}
              alt="Calm illustration of a person meditating peacefully in nature"
              width={1280}
              height={1024}
              className="w-full h-auto rounded-2xl"
            />
          </div>
          {/* Floating mood card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -bottom-4 -left-4 md:bottom-6 md:-left-6 glass rounded-2xl p-4 shadow-glow border border-border/60 max-w-[200px]"
          >
            <div className="text-xs text-muted-foreground mb-1">Today's mood</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">😊</span>
              <div>
                <div className="font-semibold text-sm">Calm & hopeful</div>
                <div className="text-xs text-muted-foreground">Keep it up!</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Backend connection test */}
      <section className="mt-10">
        <div className="rounded-3xl glass border border-border/60 shadow-card p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold">API connection test</h3>
              <p className="text-sm text-muted-foreground">
                Fetching <span className="font-mono">/health</span> from your backend.
              </p>
            </div>
            <Button
              type="button"
              onClick={testApi}
              disabled={apiLoading}
              className="rounded-full bg-gradient-primary shadow-glow"
            >
              {apiLoading ? "Testing..." : "Test backend"}
            </Button>
          </div>

          <div className="mt-4 text-sm">
            {apiError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                <div className="font-medium text-destructive">Failed to reach backend</div>
                <div className="text-muted-foreground mt-1">
                  {apiError}. Make sure the backend is running on{" "}
                  <span className="font-mono">http://localhost:3001</span> and CORS allows{" "}
                  <span className="font-mono">http://localhost:8081</span>.
                </div>
              </div>
            ) : apiResponse ? (
              <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3">
                <div className="font-medium">Backend responded:</div>
                <pre className="mt-2 overflow-x-auto text-xs bg-card/60 rounded-xl p-3 border border-border/50">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-muted-foreground">Waiting for response…</div>
            )}
          </div>
        </div>
      </section>

      {/* Mood selector */}
      <section className="mt-16 md:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl glass border border-border/60 shadow-card p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center"
        >
          <div>
            <h3 className="font-display text-2xl font-bold">How are you feeling right now?</h3>
            <p className="text-muted-foreground mt-1 text-sm">Tap a mood to log it. We'll personalize your suggestions.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {moodOptions.map((m) => {
                const active = selectedMood === m.label;
                return (
                  <button
                    key={m.label}
                    onClick={() => setSelectedMood(m.label)}
                    className={`group flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-smooth ${
                      active
                        ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow scale-105"
                        : "bg-card/60 border-border/60 hover:bg-card hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="text-xl group-hover:scale-110 transition-smooth">{m.emoji}</span>
                    <span className="font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Button asChild size="lg" className="rounded-full bg-gradient-primary shadow-glow h-12 px-7">
            <Link to="/chat">
              {selectedMood ? `Talk about feeling ${selectedMood.toLowerCase()}` : "Open chat"} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mt-24 md:mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to feel better 🌿
          </h2>
          <p className="mt-3 text-muted-foreground">
            Designed with empathy, powered by AI, built around you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-card transition-smooth hover:shadow-glow hover:-translate-y-1`}
              >
                <div className={`absolute inset-0 opacity-60 bg-gradient-to-br ${f.color}`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center shadow-soft border border-border/50">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-3xl">{f.emoji}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-center shadow-glow"
        >
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
          <div className="relative">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to take a moment for yourself? ✨
            </h3>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Start a gentle conversation with your AI companion. No pressure, no judgement.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-full bg-card text-foreground hover:bg-card/90 h-12 px-7">
              <Link to="/chat">
                Begin your journey <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
