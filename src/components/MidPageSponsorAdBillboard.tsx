import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Zap, Gift, ShieldCheck, Tag, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const MidPageSponsorAdBillboard = () => {
  return (
    <section className="my-8 space-y-4">
      {/* Section Header with Sponsored Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            বিশেষ পার্টনার ও স্পন্সরড অফারসমূহ
          </h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-border/80">
          Sponsored
        </Badge>
      </div>

      {/* 2-Column High-Impact Ad Billboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Ad 1: bKash / Payment Partner Promo */}
        <div className="relative rounded-2xl bg-gradient-to-br from-pink-700 via-rose-600 to-rose-800 text-white p-6 overflow-hidden shadow-lg group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-black/30 text-pink-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-300" />
                পেমেন্ট ক্যাশব্যাক
              </span>
              <span className="text-[10px] text-white/60">সীমিত সময়ের জন্য</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl sm:text-2xl font-black leading-tight text-white">
                বিকাশ ও নগদে পেমেন্টে ১০% নিশ্চিত ক্যাশব্যাক!
              </h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                যেকোনো বই অর্ডারে বিকাশ অথবা নগদে অগ্রিম মূল্য পরিশোধ করলেই পাচ্ছেন ইনস্ট্যান্ট ক্যাশব্যাক অফার।
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs font-mono bg-white/20 px-3 py-1.5 rounded-lg border border-white/30 text-white font-bold tracking-wider">
                কুপন: <span className="text-amber-300">BKASH10</span>
              </div>
              <Link
                to="/offers"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-white text-rose-700 px-4 py-2 rounded-xl shadow-md hover:bg-rose-50 transition-all active:scale-95"
              >
                অফার বিস্তারিত
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Ad 2: Ekushey Boi Mela & Academic Set Promo */}
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-900 text-white p-6 overflow-hidden shadow-lg group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-black/30 text-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Gift className="w-3 h-3 text-amber-300" />
                মেগা বান্ডেল ছাড়
              </span>
              <span className="text-[10px] text-white/60">সকল শ্রেণির জন্য</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl sm:text-2xl font-black leading-tight text-white">
                স্কুল ও মাদ্রাসার সিলেবাস বইসেটে ১৫% প্যাকেজ ছাড়!
              </h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                ১ম থেকে দ্বাদশ শ্রেণির সম্পূর্ণ পাঠ্যবই ও গাইড সেট এক ক্লিকে ঘরে বসেই সংগ্রহ করুন ক্যাশ অন ডেলিভারিতে।
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-emerald-200 font-medium">
                🚚 ৪৯৯৳+ ফ্রি ডেলিভারি
              </div>
              <Link
                to="/syllabus"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl shadow-md hover:bg-amber-300 transition-all active:scale-95"
              >
                সিলেবাস সেট কিনুন
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
