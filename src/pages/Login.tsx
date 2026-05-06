import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { apiFetch, setAuthToken } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async () => {
    setLoading(true);
    setError(null);
    const emailTrimmed = email.trim();
    const passwordTrimmed = password;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setLoading(false);
      setError("Please enter a valid email address.");
      return;
    }
    if (passwordTrimmed.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/signup";
      const data = (await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ email: emailTrimmed, password: passwordTrimmed }),
      })) as any;

      if (!data?.token) throw new Error("Missing token in response");
      setAuthToken(String(data.token));
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 md:py-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-3xl glass border border-border/60 shadow-glow p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">
            Mindful<span className="text-primary">AI</span>
          </span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-center">
          {mode === "login" ? "Welcome back 💙" : "Create your safe space 🌸"}
        </h1>
        <p className="text-center text-muted-foreground text-sm mt-1">
          {mode === "login" ? "Sign in to continue your journey" : "Start gently — we're glad you're here"}
        </p>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="you@calm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-muted/50 border border-border/40 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-smooth"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-muted/50 border border-border/40 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-smooth"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
              {error}
            </div>
          )}

          <Button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-primary hover:opacity-90 shadow-soft h-11 mt-2"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}{" "}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-primary font-medium hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
