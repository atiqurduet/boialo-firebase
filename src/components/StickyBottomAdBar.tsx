import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Flame, X, ArrowRight, Copy, Check, Gift } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const StickyBottomAdBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("boialo_dismiss_promo_bar");
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Do not show on checkout or order confirmation pages
  if (
    !isVisible ||
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/order-confirmation") ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("boialo_dismiss_promo_bar", "true");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("BOOK15");
    setCopied(true);
    toast.success("কুপন কোড 'BOOK15' কপি হয়েছে!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed bottom-14 md:bottom-4 left-3 right-3 md:left-auto md:right-4 md:max-w-md z-40 animate-slide-up">
      <div className="p-3.5 rounded-2xl bg-zinc-950/95 text-white backdrop-blur-md border border-amber-500/40 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
            <Flame className="w-4 h-4 text-white fill-current animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                সীমিত অফার
              </span>
              <span className="text-[10px] text-white/50">•</span>
              <button
                onClick={handleCopyCode}
                className="text-[10px] font-mono font-bold bg-white/10 hover:bg-white/20 text-white px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
              >
                BOOK15
                {copied ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                )}
              </button>
            </div>
            <p className="text-xs font-semibold text-white truncate">
              সকল বইয়ে ১৫% ছাড় ও নিশ্চিত উপহার!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/offers"
            className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs transition-all active:scale-95"
          >
            কিনুন
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
