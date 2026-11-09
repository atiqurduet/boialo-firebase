import { BookOpen, Users, Truck, Star, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatItem {
  number: string;
  label: string;
  sublabel: string;
}

interface TestimonialItem {
  name: string;
  location: string;
  comment: string;
  book: string;
  rating?: number;
  avatar?: string;
}

interface ReaderCommunityStatsProps {
  title?: string;
  subtitle?: string;
  settings?: {
    stats?: StatItem[];
    show_testimonials?: boolean;
    testimonial_badge?: string;
    testimonial_title?: string;
    testimonial_subtitle?: string;
    testimonials?: TestimonialItem[];
  };
}

export const ReaderCommunityStats = ({ title, subtitle, settings }: ReaderCommunityStatsProps) => {
  const defaultStats = [
    {
      icon: BookOpen,
      number: "৫০,০০০+",
      label: "বইয়ের বিশাল সংগ্রহ",
      sublabel: "হাজারো লেখক ও প্রকাশনীর বই",
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      icon: Users,
      number: "১,৫০,০০০+",
      label: "সন্তুষ্ট পাঠক ও পরিবার",
      sublabel: "সারাদেশ জুড়ে বিশ্বস্ত পাঠকমহল",
      color: "text-primary bg-primary/10",
    },
    {
      icon: Truck,
      number: "৬৪ জেলা",
      label: "সরাসরি ক্যাশ অন ডেলিভারি",
      sublabel: "দ্রুততম সময়ে হোম ডেলিভারি",
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      icon: Star,
      number: "৪.৯ / ৫.০",
      label: "গড় গ্রাহক সন্তুষ্টি রেটিং",
      sublabel: "২৫,০০০+ ভেরিফায়েড রিভিউ",
      color: "text-orange-600 bg-orange-500/10",
    },
  ];

  const stats = defaultStats.map((def, idx) => {
    const custom = settings?.stats?.[idx];
    return {
      ...def,
      number: custom?.number || def.number,
      label: custom?.label || def.label,
      sublabel: custom?.sublabel || def.sublabel,
    };
  });

  const defaultTestimonials: TestimonialItem[] = [
    {
      name: "তানভীর হাসান",
      location: "মিরপুর, ঢাকা",
      comment: "অর্ডার করার মাত্র ২৪ ঘণ্টার মধ্যে অরিজিনাল বই হাতে পেয়েছি। প্রিমিয়াম ওয়াটারপ্রুফ প্যাকেজিং দেখে সত্যিই মুগ্ধ হয়েছি। বইআলো আমার প্রথম পছন্দ!",
      book: "প্যারাডক্সিক্যাল সাজিদ",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
    {
      name: "নুসরাত জাহান",
      location: "হালিশহর, চট্টগ্রাম",
      comment: "স্কুলের সিলেবাসের পুরো সেট একসাথে এক ক্লিকে পেয়ে গেলাম, সাথে দারুণ ছাড় ও ফ্রি ডেলিভারি। আলাদা দোকানে খোঁজার কোনো ঝামেলাই রইল না।",
      book: "৬ষ্ঠ শ্রেণি পাঠ্যবই সেট",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    {
      name: "মাহমুদুর রহমান",
      location: "উপশহর, সিলেট",
      comment: "একটু পড়ে দেখুন (Look Inside) ফিচারটা অসাধারণ! সূচিপত্র ও নমুনা পেজ পড়ে বই পছন্দ করে অর্ডার করা এখন অনেক সহজ। ধন্যবাদ বইআলো টিম।",
      book: "বেলা ফুরাবার আগে",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    },
  ];

  const testimonials =
    Array.isArray(settings?.testimonials) && settings!.testimonials.filter((t) => t?.name && t?.comment).length > 0
      ? settings!.testimonials.filter((t) => t?.name && t?.comment).map((t, idx) => ({
          ...defaultTestimonials[idx % defaultTestimonials.length],
          ...t,
          rating: t.rating || 5,
          avatar: t.avatar || defaultTestimonials[idx % defaultTestimonials.length].avatar,
        }))
      : defaultTestimonials;

  const showTestimonials = settings?.show_testimonials !== false;
  const testimonialBadge = settings?.testimonial_badge || "বিশ্বস্ততার প্রমাণ";
  const testimonialTitle = settings?.testimonial_title || title || "আমাদের পাঠকদের মতামত ও ভালোবাসা";
  const testimonialSubtitle =
    settings?.testimonial_subtitle ||
    subtitle ||
    "দেশজুড়ে হাজারো বইপ্রেমী পাঠকের সাথে গড়ে উঠেছে বইআলোর ভালোবাসার বন্ধন।";

  return (
    <section className="my-12 space-y-8">
      {/* 4-Stat Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md transition-all text-center space-y-2 group"
            >
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:scale-110 ${stat.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {stat.number}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-foreground">{stat.label}</p>
              <p className="text-[11px] text-muted-foreground">{stat.sublabel}</p>
            </div>
          );
        })}
      </div>

      {/* Reader Testimonials Grid */}
      {showTestimonials && (
        <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {testimonialBadge}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              {testimonialTitle}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {testimonialSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, idx) => (
              <Card
                key={idx}
                className="rounded-2xl border-border bg-card/70 hover:bg-card hover:shadow-md transition-all"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      ভেরিফায়েড ক্রেতা
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-serif italic">
                    "{t.comment}"
                  </p>

                  <div className="pt-2 border-t border-border flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-foreground truncate">{t.name}</h5>
                      <p className="text-[11px] text-muted-foreground">{t.location}</p>
                      <p className="text-[10px] text-primary truncate mt-0.5">বই: {t.book}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
