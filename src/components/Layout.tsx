import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { FloatingHelp } from "./FloatingHelp";

export const Layout = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-secondary/60 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-accent/40 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
      </div>

      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingHelp />

      <footer className="border-t border-border/40 py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          Made with 💙 to help you feel better. <span className="text-foreground font-medium">MindfulAI</span> — not a substitute for professional care.
        </div>
      </footer>
    </div>
  );
};
