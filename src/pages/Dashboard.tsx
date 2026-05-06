import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Smile, Lightbulb, Activity, Calendar, Brain, Moon, Sunrise, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import journalImg from "@/assets/real-journal.jpg";
import therapyImg from "@/assets/real-therapy.jpg";
import { apiFetch, getAuthToken } from "@/lib/api";

const emotionColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("happy") || n.includes("great")) return "hsl(var(--success))";
  if (n.includes("anx") || n.includes("stress") || n.includes("upset")) return "hsl(var(--warning))";
  if (n.includes("sad") || n.includes("lonely")) return "hsl(var(--info))";
  return "hsl(var(--primary))";
};

const Dashboard = () => {
  const token = getAuthToken();
  const { data, isLoading, error } = useQuery({
    queryKey: ["moods-summary", 7],
    enabled: Boolean(token),
    queryFn: async () => apiFetch("/moods/summary?days=7") as Promise<any>,
  });

  const moodData: { day: string; mood: number | null }[] = data?.moodOverTime ?? [];
  const emotionData: { name: string; value: number; color: string }[] =
    (data?.emotionSummary ?? []).map((e: any) => ({
      name: String(e.name),
      value: Number(e.value),
      color: emotionColor(String(e.name)),
    })) ?? [];

  const stressValue = (() => {
    // rough: inverse of average mood (0-10) -> stress 0-100
    const vals = moodData.map((d) => d.mood).filter((v): v is number => typeof v === "number");
    if (!vals.length) return 0;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.max(0, Math.min(100, Math.round(((10 - avg) / 10) * 100)));
  })();
  const stress =
    stressValue >= 67
      ? { level: "High", value: stressValue, color: "hsl(var(--destructive))" }
      : stressValue >= 34
        ? { level: "Medium", value: stressValue, color: "hsl(var(--warning))" }
        : { level: "Low", value: stressValue, color: "hsl(var(--success))" };

  const todayMoodLabel = data?.todayMood?.label ? String(data.todayMood.label) : "—";
  const todayMoodEmoji = data?.todayMood?.emoji ? String(data.todayMood.emoji) : "🙂";
  const trend = typeof data?.weeklyTrendPercent === "number" ? data.weeklyTrendPercent : null;
  const hasAnyMood = moodData.some((d) => typeof d.mood === "number");

  return (
    <div className="container py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Your Mental Wellness Dashboard 📊
          </h1>
          <p className="text-muted-foreground mt-1">
            A gentle look at your emotional patterns this week.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground glass rounded-full px-4 py-2 border border-border/60">
          <Calendar className="h-4 w-4" /> This week
        </div>
      </motion.div>

      {!token && (
        <div className="rounded-3xl glass border border-border/60 shadow-card p-6">
          <div className="font-display font-semibold text-lg">Sign in to see your real mood data</div>
          <div className="text-sm text-muted-foreground mt-1">
            Your dashboard is ready—once you log in, we’ll load your mood history from the backend.
          </div>
          <Button asChild className="mt-4 rounded-full bg-gradient-primary shadow-glow">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      )}

      {token && isLoading && (
        <div className="rounded-3xl glass border border-border/60 shadow-card p-6 text-sm text-muted-foreground">
          Loading your mood data…
        </div>
      )}

      {token && error && (
        <div className="rounded-3xl glass border border-destructive/30 bg-destructive/10 shadow-card p-6 text-sm text-destructive">
          Failed to load mood data: {String((error as any)?.message ?? error)}
        </div>
      )}

      {token && !isLoading && !error && !hasAnyMood && (
        <div className="rounded-3xl glass border border-border/60 shadow-card p-6">
          <div className="font-display font-semibold text-lg">No mood history yet</div>
          <div className="text-sm text-muted-foreground mt-1">
            Once you log a few moods, your charts and trends will show up here.
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            Tip: for now you can POST moods to the backend endpoint <span className="font-mono">/moods</span>.
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <StatCard
          icon={Smile}
          emoji={todayMoodEmoji}
          title="Today's Mood"
          value={todayMoodLabel}
          subtitle={trend === null ? "Add more mood logs to see trends" : trend >= 0 ? `Up ${trend}% from last week` : `Down ${Math.abs(trend)}% from last week`}
          gradient="from-primary/15 to-secondary/40"
          delay={0}
        />
        <StatCard
          icon={TrendingUp}
          emoji="📈"
          title="Weekly Trend"
          value={trend === null ? "Not enough data" : `${trend >= 0 ? "+" : ""}${trend}%`}
          subtitle={trend === null ? "Log moods daily for insights" : trend >= 0 ? "You're on a gentle upswing" : "A slightly tougher week"}
          gradient="from-accent/40 to-primary/10"
          delay={0.1}
        />
        <StatCard
          icon={Lightbulb}
          emoji="💡"
          title="Suggestions"
          value="3 ready for you"
          subtitle="Tailored to your mood"
          gradient="from-secondary/50 to-accent/30"
          delay={0.2}
          action={
            <Button asChild variant="link" size="sm" className="px-0 h-auto text-primary">
              <Link to="/suggestions">View all →</Link>
            </Button>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2 rounded-3xl glass border border-border/60 p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Mood over time</h3>
              <p className="text-xs text-muted-foreground">Daily score (0–10)</p>
            </div>
            {trend !== null && (
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  trend >= 0
                    ? "bg-success/15 text-success-foreground border-success/20"
                    : "bg-warning/15 text-warning-foreground border-warning/20"
                }`}
              >
                {trend >= 0 ? "Trending up" : "Trending down"}
              </span>
            )}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="url(#moodLine)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl glass border border-border/60 p-6 shadow-card"
        >
          <h3 className="font-display font-semibold">Stress level</h3>
          <p className="text-xs text-muted-foreground">Based on this week's signals</p>

          <div className="mt-6 flex items-center justify-center">
            <div className="relative h-40 w-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={stress.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(stress.value / 100) * 264} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-bold">{stress.value}%</span>
                <span className="text-xs text-success font-medium">{stress.level}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            {["Low", "Medium", "High"].map((l) => (
              <div
                key={l}
                className={`rounded-xl py-2 border ${
                  l === stress.level ? "bg-success/15 border-success/40 text-success-foreground font-medium" : "border-border/40 text-muted-foreground"
                }`}
              >
                {l}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl glass border border-border/60 p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> AI insights for you 💡
            </h3>
            <p className="text-xs text-muted-foreground">Patterns we noticed this week</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
            Updated today
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Moon, emoji: "🌙", title: "Evenings feel heavier", desc: "You feel more stressed between 7–10pm. A short wind-down routine could help.", img: journalImg },
            { icon: Sunrise, emoji: "🌅", title: "Mornings lift you up", desc: "Your mood scores are highest before noon. Anchor your day with light & water.", img: null },
            { icon: Heart, emoji: "💙", title: "Talking helps you", desc: "After chat sessions, your stress drops by ~22% on average.", img: therapyImg },
          ].map((insight, i) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 transition-smooth hover:-translate-y-1 hover:shadow-glow"
              >
                {insight.img && (
                  <div className="h-28 overflow-hidden">
                    <img src={insight.img} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-smooth" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-lg">{insight.emoji}</span>
                  </div>
                  <h4 className="font-display font-semibold text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Emotional summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl glass border border-border/60 p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Weekly emotional summary
            </h3>
            <p className="text-xs text-muted-foreground">Frequency of detected emotions</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  emoji,
  title,
  value,
  subtitle,
  gradient,
  delay = 0,
  action,
}: {
  icon: any;
  emoji: string;
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
  delay?: number;
  action?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-card"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70`} />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-2xl bg-card flex items-center justify-center shadow-soft border border-border/50">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="font-display text-xl font-semibold mt-0.5">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  </motion.div>
);

export default Dashboard;
