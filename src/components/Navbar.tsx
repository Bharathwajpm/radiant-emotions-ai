import { Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Brain, Moon, Sun, MessageCircle, BarChart3, Sparkles, Home } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/suggestions", label: "Suggestions", icon: Sparkles },
];

export const Navbar = () => {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-border/50">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-soft transition-smooth group-hover:scale-105">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Mindful<span className="text-primary">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-full bg-muted/50 p-1 border border-border/40">
            {links.map((l) => {
              const active = pathname === l.to;
              const Icon = l.icon;
              return (
                <RouterNavLink
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-smooth",
                    active
                      ? "bg-card text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </RouterNavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button asChild className="rounded-full bg-gradient-primary hover:opacity-90 shadow-soft hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden glass border-b border-border/50">
        <div className="container flex items-center justify-around py-2">
          {links.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            return (
              <RouterNavLink
                key={l.to}
                to={l.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium transition-smooth",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </RouterNavLink>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
