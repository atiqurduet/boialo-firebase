import { Link } from "react-router-dom";
import { ArrowRight, Zap, Gift, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BillboardProps {
  title?: string;
  subtitle?: string;
  settings?: {
    ad1_badge?: string;
    ad1_tag?: string;
    ad1_title?: string;
    ad1_description?: string;
    ad1_coupon?: string;
    ad1_button_text?: string;
    ad1_button_link?: string;
    ad2_badge?: string;
    ad2_tag?: string;
    ad2_title?: string;
    ad2_description?: string;
    ad2_footer_text?: string;
    ad2_button_text?: string;
    ad2_button_link?: string;
  };
}

export const MidPageSponsorAdBillboard = ({ title, subtitle, settings }: BillboardProps) => {
  const sectionTitle = title || "বিশেষ পার্টনার ও স্পন্সরড অফারসমূহ";
  const sectionTag = subtitle || "Sponsored";

  const ad1 = {
    badge: settings?.ad1_badge || "পেমেন্ট ক্যাশব্যাক",
    tag: settings?.ad1_tag || "সীমিত সময়ের জন্য",
    title: settings?.ad1_title || "বিকাশ ও নগদে পেমেন্টে ১০% নিশ্চিত ক্যাশব্যাক!",
    description: settings?.ad1_description || "যেকোনো বই অর্ডারে বিকাশ অথবা নগদে অগ্রিম মূল্য পরিশোধ করলেই পাচ্ছেন ইনস্ট্যান্ট ক্যাশব্যাক অফার।",
    coupon: settings?.ad1_coupon || "BKASH10",
    buttonText: settings?.ad1_button_text || "অফার বিস্তারিত",
    buttonLink: settings?.ad1_button_link || "/offers",
  };

  const ad2 = {
    badge: settings?.ad2_badge || "মেগা বান্ডেল ছাড়",
    tag: settings?.ad2_tag || "সকল শ্রেণির জন্য",
    title: settings?.ad2_title || "স্কুল ও মাদ্রাসার সিলেবাস বইসেটে ১৫% প্যাকেজ ছাড়!",
    description: settings?.ad2_description || "১ম থেকে দ্বাদশ শ্রেণির সম্পূর্ণ পাঠ্যবই ও গাইড সেট এক ক্লিকে ঘরে বসেই সংগ্রহ করুন ক্যাশ অন ডেলিভারিতে।",
    footerText: settings?.ad2_footer_text || "🚚 ৪৯৯৳+ ফ্রি ডেলিভারি",
    buttonText: settings?.ad2_button_text || "সিলেবাস সেট কিনুন",
    buttonLink: settings?.ad2_button_link || "/syllabus",
  };

  return (
    <section className="my-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            {sectionTitle}
          </h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-border/80">
          {sectionTag}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Ad 1 */}
        <div className="relative rounded-2xl bg-gradient-to-br from-pink-700 via-rose-600 to-rose-800 text-white p-6 overflow-hidden shadow-lg group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-black/30 text-pink-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-300" />
                {ad1.badge}
              </span>
              <span className="text-[10px] text-white/60">{ad1.tag}</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl sm:text-2xl font-black leading-tight text-white">
                {ad1.title}
              </h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {ad1.description}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs font-mono bg-white/20 px-3 py-1.5 rounded-lg border border-white/30 text-white font-bold tracking-wider">
                কুপন: <span className="text-amber-300">{ad1.coupon}</span>
              </div>
              <Link
                to={ad1.buttonLink}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-white text-rose-700 px-4 py-2 rounded-xl shadow-md hover:bg-rose-50 transition-all active:scale-95"
              >
                {ad1.buttonText}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Ad 2 */}
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-900 text-white p-6 overflow-hidden shadow-lg group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-black/30 text-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Gift className="w-3 h-3 text-amber-300" />
                {ad2.badge}
              </span>
              <span className="text-[10px] text-white/60">{ad2.tag}</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl sm:text-2xl font-black leading-tight text-white">
                {ad2.title}
              </h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {ad2.description}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-emerald-200 font-medium">
                {ad2.footerText}
              </div>
              <Link
                to={ad2.buttonLink}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl shadow-md hover:bg-amber-300 transition-all active:scale-95"
              >
                {ad2.buttonText}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
