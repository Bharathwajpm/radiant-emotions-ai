import { useState } from "react";
import { LifeBuoy, X, Phone, MessageCircle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export const FloatingHelp = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-72 rounded-2xl bg-card glass shadow-glow border border-border/60 p-5"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-display font-semibold">Need support? 💙</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  We're here for you, anytime.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                to="/chat"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-muted/60 hover:bg-muted px-3 py-2.5 transition-smooth text-sm"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                Talk to AI now
              </Link>
              <a
                href="tel:988"
                className="flex items-center gap-3 rounded-xl bg-muted/60 hover:bg-muted px-3 py-2.5 transition-smooth text-sm"
              >
                <Phone className="h-4 w-4 text-primary" />
                Crisis hotline (988)
              </a>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              In an emergency, please call your local services.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Help"
        className="h-14 w-14 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center text-primary-foreground"
      >
        {open ? <X className="h-6 w-6" /> : <LifeBuoy className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};
