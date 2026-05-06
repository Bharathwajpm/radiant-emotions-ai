import { motion } from "framer-motion";
import { Leaf, Wind, Sparkles, Music, Sun, BookOpen, Heart, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const groups = [
  {
    title: "Relaxation tips 🌿",
    items: [
      { icon: Leaf, title: "5-minute grounding", desc: "Notice 5 things you see, 4 you can touch, 3 sounds, 2 smells, 1 taste.", color: "from-accent/60 to-secondary/30" },
      { icon: Sun, title: "Step into sunlight", desc: "10 minutes of natural light can reset your mood and energy.", color: "from-yellow-200/40 to-secondary/30" },
      { icon: Coffee, title: "Mindful sip", desc: "Drink something warm slowly, focusing on each sensation.", color: "from-orange-200/40 to-accent/30" },
    ],
  },
  {
    title: "Breathing exercises 🧘",
    items: [
      { icon: Wind, title: "4-7-8 breathing", desc: "Inhale 4s, hold 7s, exhale 8s. Repeat 4 times to calm your nervous system.", color: "from-primary/15 to-secondary/40" },
      { icon: Wind, title: "Box breathing", desc: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Used by Navy SEALs to focus.", color: "from-secondary/50 to-primary/10" },
      { icon: Heart, title: "Heart coherence", desc: "Breathe slowly while focusing on a feeling of gratitude for 5 minutes.", color: "from-pink-200/40 to-primary/10" },
    ],
  },
  {
    title: "Motivation & joy ✨",
    items: [
      { icon: Sparkles, title: "“This too shall pass”", desc: "Every emotion is a visitor. Let it be felt, then let it move on.", color: "from-primary/20 to-accent/30" },
      { icon: BookOpen, title: "One-line journaling", desc: "Write one sentence about today. No pressure, just presence.", color: "from-accent/50 to-secondary/40" },
      { icon: Music, title: "Mood-lifting playlist", desc: "Put on a song that always makes you smile. Move a little if you can.", color: "from-secondary/50 to-primary/10" },
    ],
  },
];

const Suggestions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="container py-10 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-card/80 border border-border/60 px-4 py-1.5 text-sm shadow-card backdrop-blur mb-4">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Personalized for your mood
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Gentle suggestions for you 💡
        </h1>
        <p className="text-muted-foreground mt-2">
          Small steps, big difference. Pick whatever feels right today.
        </p>
      </motion.div>

      {groups.map((g, gi) => (
        <section key={g.title}>
          <h2 className="font-display text-xl font-semibold mb-4">{g.title}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {g.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 + gi * 0.05 }}
                  className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-card transition-smooth hover:shadow-glow hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60`} />
                  <div className="relative">
                    <div className="h-11 w-11 rounded-2xl bg-card flex items-center justify-center shadow-soft border border-border/50 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
                    <button
                      className="mt-4 text-sm font-medium text-primary hover:underline"
                      onClick={() => {
                        toast({ title: "Added to chat", description: "Opening chat with this suggestion." });
                        navigate(`/chat?prompt=${encodeURIComponent(`${item.title}. ${item.desc}`)}`);
                      }}
                    >
                      Try this →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Suggestions;
