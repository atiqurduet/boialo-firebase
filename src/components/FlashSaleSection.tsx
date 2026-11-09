import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ChevronRight, ShoppingCart, Flame, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FlashSaleSectionProps {
  title?: string;
  subtitle?: string;
  settings?: any;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  title: propTitle,
  subtitle: propSubtitle,
  settings: propSettings = {},
}) => {
  const { addToCart } = useCartContext();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const { data: dbSettings } = useQuery({
    queryKey: ['flash-sale-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'flash_sale_enabled',
          'flash_sale_title',
          'flash_sale_discount_percent',
          'flash_sale_end_time',
        ]);
      const mapped: Record<string, any> = {};
      data?.forEach((d) => {
        mapped[d.setting_key] = d.setting_value;
      });
      return mapped;
    },
  });

  const { data: allCategories = [] } = useQuery({
    queryKey: ['flash-sale-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, parent_id')
        .eq('is_active', true);
      return data || [];
    },
  });

  const limit = Number(propSettings?.limit) || 4;
  const columns = Number(propSettings?.columns) || 4;
  const selectedCategoryIds: string[] = propSettings?.category_ids || [];
  const selectedProductIds: string[] = propSettings?.product_ids || [];

  const { data: allProducts = [] } = useQuery({
    queryKey: ['flash-sale-products-all'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const flashProducts = useMemo(() => {
    let list = allProducts as any[];
    if (selectedProductIds.length > 0) {
      const picked = list.filter((p) => selectedProductIds.includes(p.id));
      if (picked.length > 0) return picked.slice(0, limit);
    }
    if (selectedCategoryIds.length > 0) {
      const validCatIds = new Set<string>(selectedCategoryIds);
      allCategories.forEach((c: any) => {
        if (c.parent_id && validCatIds.has(c.parent_id)) {
          validCatIds.add(c.id);
        }
      });
      const catFiltered = list.filter((p) => p.category_id && validCatIds.has(p.category_id));
      if (catFiltered.length > 0) list = catFiltered;
    }
    return list.slice(0, limit);
  }, [allProducts, selectedProductIds, selectedCategoryIds, allCategories, limit]);

  const isEnabled = dbSettings?.flash_sale_enabled !== false && dbSettings?.flash_sale_enabled !== 'false';
  const displayTitle = propTitle || dbSettings?.flash_sale_title || 'আজকের লিমিটেড টাইম ফ্ল্যাশ সেল';
  const displaySubtitle = propSubtitle || 'সীমিত সময়ের জন্য বিশেষ মেগা ছাড় — স্টক শেষ হওয়ার আগেই অর্ডার করুন';
  const discountPercent = Number(propSettings?.min_discount || dbSettings?.flash_sale_discount_percent) || 35;
  const badgeText = propSettings?.badge_text || 'লাইভ ফ্ল্যাশ ডিল • সীমিত স্টক';
  const buttonText = propSettings?.button_text || 'কার্টে নিন';
  const viewAllText = propSettings?.view_all_text || 'সকল ফ্ল্যাশ ডিল এক্সপ্লোর করুন';
  const viewAllLink = propSettings?.view_all_link || '/offers';
  const countdownHours = Number(propSettings?.countdown_hours) || 12;

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 42, seconds: 18 });

  useEffect(() => {
    const customEndTime = propSettings?.end_time || dbSettings?.flash_sale_end_time;
    const targetTime = customEndTime
      ? new Date(customEndTime).getTime()
      : Date.now() + countdownHours * 3600 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [propSettings?.end_time, dbSettings?.flash_sale_end_time, countdownHours]);

  if (!isEnabled || !flashProducts || flashProducts.length === 0) return null;

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  const handleAddToCart = async (product: any, flashPrice: number) => {
    try {
      setAddingId(product.id);
      await addToCart(product.id, 1);
      setJustAddedId(product.id);
      toast.success(`'${product.title_bn}' ৳${flashPrice} মূল্যে কার্টে যোগ হয়েছে!`);
      setTimeout(() => {
        setJustAddedId((curr) => (curr === product.id ? null : curr));
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error('কার্টে যোগ করতে সমস্যা হয়েছে');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <section className="my-6 container">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-red-900 to-amber-950 p-5 sm:p-8 text-white shadow-2xl border border-red-500/20">
        {/* Glow orb accents */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Top Header Row with Pulsing Badge & Countdown Clock */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-7 relative z-10 border-b border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/25 border border-red-400/30 text-amber-300 text-xs font-bold tracking-wide shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <Flame className="w-3.5 h-3.5 fill-amber-300" />
              <span>{badgeText}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {displayTitle}
            </h2>
            <p className="text-xs sm:text-sm text-red-100/80 font-normal">
              {displaySubtitle}
            </p>
          </div>

          {/* Segmented Countdown Box */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 self-start lg:self-auto shadow-lg">
            <div className="flex items-center gap-1.5 text-amber-300 mr-1">
              <Clock className="w-4 h-4 animate-spin text-amber-300" style={{ animationDuration: '8s' }} />
              <span className="text-xs font-bold text-white/90">অফার শেষ হতে:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/20 text-amber-300 px-2.5 py-1 rounded-lg font-mono font-extrabold text-base sm:text-lg min-w-[38px] shadow-inner">
                  {format2Digits(timeLeft.hours)}
                </div>
                <span className="text-[10px] text-white/70 tracking-wider">ঘণ্টা</span>
              </div>
              <span className="text-amber-300 font-bold -mt-3.5 text-lg">:</span>
              <div className="text-center">
                <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/20 text-amber-300 px-2.5 py-1 rounded-lg font-mono font-extrabold text-base sm:text-lg min-w-[38px] shadow-inner">
                  {format2Digits(timeLeft.minutes)}
                </div>
                <span className="text-[10px] text-white/70 tracking-wider">মিনিট</span>
              </div>
              <span className="text-amber-300 font-bold -mt-3.5 text-lg">:</span>
              <div className="text-center">
                <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/20 text-amber-300 px-2.5 py-1 rounded-lg font-mono font-extrabold text-base sm:text-lg min-w-[38px] shadow-inner">
                  {format2Digits(timeLeft.seconds)}
                </div>
                <span className="text-[10px] text-white/70 tracking-wider">সেকেন্ড</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div
          className={cn("grid grid-cols-2 gap-3.5 sm:gap-5 relative z-10", {
            "md:grid-cols-2": columns === 2,
            "md:grid-cols-3": columns === 3,
            "md:grid-cols-4": columns === 4 || !columns,
            "md:grid-cols-5": columns >= 5,
          })}
        >
          {flashProducts.map((p: any, idx: number) => {
            const originalPrice = p.original_price || Math.round(p.price * 1.35);
            const flashPrice = Math.round(originalPrice * (1 - discountPercent / 100));
            const soldPercent = [82, 89, 94, 76][idx % 4];
            const isAdding = addingId === p.id;
            const isJustAdded = justAddedId === p.id;

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between bg-card text-card-foreground rounded-2xl p-3 sm:p-3.5 border border-border/80 shadow-lg hover:shadow-2xl hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Discount Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2.5 py-1 text-[11px] font-black bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg shadow-md flex items-center gap-1 border border-white/20">
                    <Zap className="w-3 h-3 fill-current text-amber-200" />
                    -{discountPercent}%
                  </span>
                </div>

                {/* Book Cover Image */}
                <Link to={`/product/${p.slug}`} className="block overflow-hidden rounded-xl aspect-3/4 mb-3 bg-muted relative">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80'}
                    alt={p.title_bn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {/* Content & Details */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      <Link to={`/product/${p.slug}`}>{p.title_bn}</Link>
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {p.author || 'জনপ্রিয় লেখক'}
                    </p>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-base sm:text-xl font-black text-red-600 dark:text-red-400">
                      ৳{flashPrice}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ৳{originalPrice}
                    </span>
                  </div>

                  {/* Stock Progress Meter */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                      <span>স্টক সীমিত</span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        🔥 {soldPercent}% বুকড
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 rounded-full transition-all duration-700 shadow-xs"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Add To Cart Button */}
                  <Button
                    size="sm"
                    disabled={isAdding}
                    className={`w-full mt-2 font-bold text-xs h-9 transition-all shadow-md ${
                      isJustAdded
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white hover:shadow-lg'
                    }`}
                    onClick={() => handleAddToCart(p, flashPrice)}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        যোগ হচ্ছে...
                      </>
                    ) : isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        যোগ হয়েছে!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        {buttonText}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer View All link */}
        <div className="text-center mt-6 relative z-10">
          <Link
            to={viewAllLink}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-amber-200 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20 backdrop-blur-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{viewAllText}</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
