import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles, Truck, Gift, ShieldCheck, Zap, ArrowRight, BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PromoTickerItem {
  icon: any;
  text: string;
  badge?: string;
  link: string;
}

export const PromoTickerMarquee = () => {
  const [siteText, setSiteText] = useState<string>("");

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "pre_header_text")
          .maybeSingle();
        if (data?.setting_value) {
          setSiteText(String(data.setting_value).replace(/^"|"$/g, ""));
        }
      } catch {}
    };
    fetchSetting();
  }, []);

  const items: PromoTickerItem[] = [
    {
      icon: Flame,
      text: siteText || "আজ মধ্যরাত পর্যন্ত বিশেষ ফ্ল্যাশ সেল চলছে! কুপন কোড: BOOK15",
      badge: "হট ডিল",
      link: "/offers",
    },
    {
      icon: Truck,
      text: "সমগ্র বাংলাদেশে ৪৯৯৳ বা তদূর্ধ্ব অর্ডারে নিশ্চিত ফ্রি ডেলিভারি!",
      badge: "ফ্রি ডেলিভারি",
      link: "/shop",
    },
    {
      icon: Gift,
      text: "প্রতিটি অর্ডারে বিশেষ উপহার হিসেবে পাচ্ছেন প্রিমিয়াম ক্যালিগ্রাফি বুকমার্ক",
      badge: "গিফট অফার",
      link: "/offers",
    },
    {
      icon: ShieldCheck,
      text: "১০০% আসল বই ও ক্যাশ অন ডেলিভারি — হাতে পেয়ে মূল্য পরিশোধ করুন",
      badge: "বিশ্বস্ত সেবা",
      link: "/about",
    },
    {
      icon: Zap,
      text: "নতুন প্রকাশিত বই ও অমর একুশে বইমেলার বেস্টসেলার সংকলন স্টক রেডি!",
      badge: "নতুন রিলিজ",
      link: "/shop?sort=newest",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-primary text-white py-2 overflow-hidden shadow-inner border-y border-amber-500/30 select-none">
      <div className="flex items-center">
        {/* Fixed Label on left (desktop) */}
        <div className="hidden md:flex items-center gap-1.5 px-4 bg-black/30 backdrop-blur-md rounded-r-full py-1 text-xs font-bold text-amber-200 shrink-0 z-10 border-r border-amber-400/30">
          <BellRing className="w-3.5 h-3.5 animate-bounce text-amber-300" />
          <span>তাজা অফার:</span>
        </div>

        {/* Marquee Scroller */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-10 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
            {[...items, ...items].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.link}
                  className="inline-flex items-center gap-2 text-xs md:text-sm font-medium hover:text-amber-200 transition-colors group shrink-0"
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 text-amber-200" />
                  </span>
                  {item.badge && (
                    <span className="bg-black/30 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  <span>{item.text}</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                  <span className="mx-2 text-white/40">•</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
