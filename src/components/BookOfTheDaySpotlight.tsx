import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Zap,
  BookOpen,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  Flame,
  Shield,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCartContext } from "@/contexts/CartContext";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { QuickCheckoutModal } from "./QuickCheckoutModal";
import { BookLookInsideModal } from "./BookLookInsideModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookSpotlightProps {
  product?: {
    id: string;
    title: string;
    author: string;
    publisher?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    description?: string;
    slug: string;
  };
}

export const BookOfTheDaySpotlight = ({ product }: BookSpotlightProps) => {
  const [quickOpen, setQuickOpen] = useState(false);
  const [lookInsideOpen, setLookInsideOpen] = useState(false);
  const { addToCart } = useCartContext();
  const { isInWishlist, toggleWishlist } = useWishlistContext();

  // Simulated countdown for Book of the Day
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const spotlightBook = product || {
    id: "spotlight-1",
    title: "প্যারাডক্সিক্যাল সাজিদ — সম্পূর্ণ সংকলন (১ম ও ২য় খণ্ড)",
    author: "আরিফ আজাদ",
    publisher: "সমকালীন প্রকাশন",
    price: 490,
    originalPrice: 650,
    discount: 25,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    description:
      "বিশ্বাস ও যুক্তির এক অভাবনীয় যুগলবন্দী। বইটিতে প্রতিটি গল্পে বৈজ্ঞানিক ও যৌক্তিক বিশ্লেষণের মাধ্যমে অবিশ্বাসের দেয়াল ভেঙে সত্যের আলো জ্বালানো হয়েছে। প্রতিটি তরুণের লাইব্রেরিতে অবশ্য পাঠ্য এক মাস্টারপিস।",
    slug: "paradoxical-sajid",
  };

  const inWishlist = isInWishlist(spotlightBook.id);

  const handleAddToCart = () => {
    addToCart(spotlightBook.id);
    toast.success("বইটি কার্টে যোগ করা হয়েছে!");
  };

  return (
    <section className="relative my-8 overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-stone-900 to-amber-950 text-white p-6 sm:p-10 shadow-2xl border border-amber-500/20">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3D Book Display (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative group">
            {/* Glow backing */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500" />

            {/* Book Cover Container with 3D shadow */}
            <div className="relative w-52 sm:w-64 aspect-[3/4.2] rounded-xl overflow-hidden shadow-2xl border border-white/20 transform group-hover:-translate-y-1 group-hover:rotate-1 transition-all duration-300">
              <img
                src={spotlightBook.image}
                alt={spotlightBook.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Discount Tag */}
              {spotlightBook.discount && (
                <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  {spotlightBook.discount}% ছাড়
                </div>
              )}

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(spotlightBook.id)}
                className={cn(
                  "absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all",
                  inWishlist
                    ? "bg-red-500 text-white"
                    : "bg-black/40 text-white/80 hover:bg-black/60 hover:text-white"
                )}
                title="উইশলিস্টে রাখুন"
              >
                <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Scarcity Meter */}
          <div className="w-full max-w-xs mt-6 space-y-1.5 bg-black/30 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1 text-amber-300">
                <Flame className="w-3.5 h-3.5" />
                সীমিত স্টক বাকি
              </span>
              <span className="font-bold text-red-400">আর মাত্র ১৪টি কপি</span>
            </div>
            <Progress value={82} className="h-2 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-500" />
          </div>
        </div>

        {/* Right Column: Editorial & Buy Box (7 cols) */}
        <div className="lg:col-span-7 space-y-5 text-left">
          {/* Top Badges & Countdown */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                আজকের সেরা নির্বাচিত বই (Editor's Pick)
              </span>
              <span className="text-xs text-white/60">#১ বেস্টসেলার</span>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-1.5 text-xs bg-black/40 px-3 py-1.5 rounded-full border border-white/10 font-mono text-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")} বাকি
              </span>
            </div>
          </div>

          {/* Title & Writer */}
          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              {spotlightBook.title}
            </h3>
            <p className="text-sm sm:text-base text-amber-200/90 font-medium">
              লেখক: <span className="text-white font-semibold">{spotlightBook.author}</span>
              {spotlightBook.publisher && (
                <span className="text-white/60"> • {spotlightBook.publisher}</span>
              )}
            </p>
          </div>

          {/* Rating Stars & Stats */}
          <div className="flex items-center gap-3 text-xs text-white/80">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
              <span className="font-bold ml-1 text-white">৪.৯</span>
            </div>
            <span>(১,২৪০+ পাঠক রিভিউ)</span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="hidden sm:inline text-emerald-400 font-medium">ইন-স্টক রেডি ডেলিভারি</span>
          </div>

          {/* Description Quote */}
          <blockquote className="text-sm text-white/80 leading-relaxed italic border-l-2 border-amber-400/60 pl-3.5 py-0.5 font-serif">
            "{spotlightBook.description}"
          </blockquote>

          {/* Pricing & Savings */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-400">
              ৳{spotlightBook.price}
            </span>
            {spotlightBook.originalPrice && (
              <span className="text-lg text-white/50 line-through">
                ৳{spotlightBook.originalPrice}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
              সাশ্রয় ৳{(spotlightBook.originalPrice || 0) - spotlightBook.price}
            </span>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setQuickOpen(true)}
              className="flex-1 sm:flex-initial h-12 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              ১-ক্লিকে দ্রুত অর্ডার
            </button>

            <Button
              variant="outline"
              onClick={handleAddToCart}
              className="h-12 px-5 rounded-xl font-semibold text-sm gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <ShoppingBag className="w-4 h-4" />
              কার্টে যোগ
            </Button>

            <Button
              variant="ghost"
              onClick={() => setLookInsideOpen(true)}
              className="h-12 px-4 rounded-xl text-xs font-medium text-amber-300 hover:text-white hover:bg-white/10 gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              একটু পড়ে দেখুন
            </Button>
          </div>

          {/* Service Guarantee Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/70 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ক্যাশ অন ডেলিভারি
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              ১০০% আসল বই
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              ৭ দিনে সহজ রিটার্ন
            </span>
          </div>
        </div>
      </div>

      {/* Connected Modals */}
      <QuickCheckoutModal
        product={{
          id: spotlightBook.id,
          title: spotlightBook.title,
          slug: spotlightBook.slug,
          price: spotlightBook.price,
          originalPrice: spotlightBook.originalPrice,
          discount: spotlightBook.discount,
          image: spotlightBook.image,
          writer: spotlightBook.author,
        }}
        open={quickOpen}
        onOpenChange={setQuickOpen}
      />

      <BookLookInsideModal
        product={{
          id: spotlightBook.id,
          title: spotlightBook.title,
          author: spotlightBook.author,
          publisher: spotlightBook.publisher,
          price: spotlightBook.price,
          originalPrice: spotlightBook.originalPrice,
          discount: spotlightBook.discount,
          image: spotlightBook.image,
          description: spotlightBook.description,
        }}
        open={lookInsideOpen}
        onOpenChange={setLookInsideOpen}
        onAddToCart={handleAddToCart}
        onQuickCheckout={() => {
          setLookInsideOpen(false);
          setQuickOpen(true);
        }}
      />
    </section>
  );
};
