import React, { useState, useMemo } from 'react';
import { Plus, Check, Trash2, ShoppingBag, Sparkles, Tag, Gift, Percent, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CustomComboBuilderProps {
  title?: string;
  subtitle?: string;
  settings?: any;
}

export const CustomComboBuilder: React.FC<CustomComboBuilderProps> = ({
  title,
  subtitle,
  settings: propSettings,
}) => {
  const { addToCart } = useCartContext();
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  const { data: dbSettings } = useQuery({
    queryKey: ['combo-builder-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['combo_builder_enabled', 'combo_discount_percent']);
      const mapped: Record<string, any> = {};
      data?.forEach((d) => {
        mapped[d.setting_key] = d.setting_value;
      });
      return mapped;
    },
  });

  // Load categories directly from database
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['combo-builder-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name_bn, slug, parent_id, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      return data || [];
    },
  });

  const limit = Number(propSettings?.limit) || 32;

  const { data: products = [] } = useQuery({
    queryKey: ['combo-builder-products', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, title_bn, author, price, original_price, images, category_id, is_active, is_bestseller')
        .eq('is_active', true)
        .order('price', { ascending: false })
        .limit(limit);
      return data || [];
    },
  });

  const isEnabled =
    propSettings?.enabled !== false &&
    dbSettings?.combo_builder_enabled !== false &&
    dbSettings?.combo_builder_enabled !== 'false';

  const tier1Discount = Number(propSettings?.discount_percent || dbSettings?.combo_discount_percent) || 10;
  const tier2Discount = Number(propSettings?.tier2_discount) || 15;
  const minBooks = Number(propSettings?.min_books) || 2;
  const maxBooks = Number(propSettings?.max_books) || 3;
  const badgeText = propSettings?.badge_text || 'স্মার্ট কম্বো সেভার বিল্ডার';
  const giftText = propSettings?.gift_text || 'ফ্রি ইসলামিক ক্যালিগ্রাফি বুকমার্ক';
  const buttonText = propSettings?.button_text || 'কম্বো কার্টে যোগ করুন';
  const configuredCategoryIds: string[] = propSettings?.category_ids || [];
  const configuredProductIds: string[] = propSettings?.product_ids || [];

  // Filter base products by configuredProductIds or configuredCategoryIds if specified by Admin
  const availableProducts = useMemo(() => {
    let list = products as any[];
    if (configuredProductIds.length > 0) {
      const picked = list.filter((p) => configuredProductIds.includes(p.id));
      if (picked.length > 0) return picked;
    }
    if (configuredCategoryIds.length > 0) {
      const validCatIds = new Set<string>(configuredCategoryIds);
      dbCategories.forEach((c: any) => {
        if (c.parent_id && validCatIds.has(c.parent_id)) {
          validCatIds.add(c.id);
        }
      });
      const catFiltered = list.filter((p) => p.category_id && validCatIds.has(p.category_id));
      if (catFiltered.length > 0) list = catFiltered;
    }
    return list;
  }, [products, configuredProductIds, configuredCategoryIds, dbCategories]);

  // Dynamic category tabs from database
  const filterCategories = useMemo(() => {
    if (configuredCategoryIds.length > 0) {
      return configuredCategoryIds
        .map((id) => dbCategories.find((c: any) => c.id === id))
        .filter(Boolean);
    }
    // All parent categories from database (or categories that have books)
    const parents = dbCategories.filter((c: any) => !c.parent_id);
    return parents.length > 0 ? parents : dbCategories;
  }, [dbCategories, configuredCategoryIds]);

  if (!isEnabled) return null;

  const toggleSelectBook = (id: string) => {
    if (selectedBookIds.includes(id)) {
      setSelectedBookIds(selectedBookIds.filter((bId) => bId !== id));
    } else {
      if (selectedBookIds.length >= maxBooks) {
        toast.info(`সর্বোচ্চ ${maxBooks}টি বইয়ের কম্বো বানাতে পারবেন। একটি বই বাদ দিয়ে নতুন বই নির্বাচন করুন।`);
        return;
      }
      setSelectedBookIds([...selectedBookIds, id]);
    }
  };

  const selectedBooks = availableProducts.filter((p: any) => selectedBookIds.includes(p.id));
  const subtotal = selectedBooks.reduce((sum: number, b: any) => sum + Number(b.price || 0), 0);

  const currentDiscountPercent =
    selectedBooks.length >= maxBooks
      ? tier2Discount
      : selectedBooks.length >= minBooks
      ? tier1Discount
      : 0;
  const discountAmount =
    currentDiscountPercent > 0 ? Math.round((subtotal * currentDiscountPercent) / 100) : 0;
  const comboTotal = Math.max(0, subtotal - discountAmount);

  const handleAddComboToCart = async () => {
    if (selectedBooks.length < minBooks) {
      toast.error(`কম্বো তৈরি করতে অন্তত ${minBooks}টি বই নির্বাচন করুন`);
      return;
    }

    setIsAdding(true);
    try {
      for (const book of selectedBooks) {
        await addToCart(book.id, 1);
      }

      toast.success(
        `🎉 চমৎকার! ${selectedBooks.length}টি বইয়ের কম্বো (${currentDiscountPercent}% স্পেশাল সেভার ছাড় সহ) সফলভাবে কার্টে যোগ হয়েছে!`
      );
      setSelectedBookIds([]);
    } catch (error) {
      console.error('Error adding combo to cart:', error);
      toast.error('কার্টে বইগুলো যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredProducts = availableProducts.filter((b: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'under_300') return Number(b.price) <= 300;
    if (activeFilter === 'bestseller') return b.is_bestseller || Number(b.price) >= 300;
    // Match database category or any of its subcategories
    const childIds = dbCategories
      .filter((c: any) => c.parent_id === activeFilter)
      .map((c: any) => c.id);
    const matchIds = new Set([activeFilter, ...childIds]);
    return b.category_id && matchIds.has(b.category_id);
  });

  const slotsArray = Array.from({ length: maxBooks }, (_, i) => i);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-emerald-500/5 p-4 sm:p-7 shadow-xl my-8">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header Zone */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-5 border-b border-border/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span>{badgeText}</span>
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              মেগা সেভিং
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
            {title || 'নিজের পছন্দের কম্বো বানিয়ে নিন'}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            {subtitle ||
              `পছন্দের যেকোনো ${minBooks}টি বইয়ে ${tier1Discount}% ছাড় এবং ${maxBooks}টি বইয়ে ${tier2Discount}% মেগা ছাড় সাথে ${giftText} উপহার!`}
          </p>
        </div>

        {/* Tier Status Indicators */}
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-xs border border-border rounded-2xl p-1.5 shadow-xs">
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedBooks.length >= minBooks
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-muted-foreground bg-muted/60'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{minBooks}টি বই = {tier1Discount}% ছাড়</span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedBooks.length >= maxBooks
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-muted-foreground bg-muted/60'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{maxBooks}টি বই = {tier2Discount}% + ফ্রি উপহার</span>
          </div>
        </div>
      </div>

      {/* Visual Combo Slots Row */}
      <div className="mb-6 bg-background/60 backdrop-blur-xs border border-border/70 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary" /> আপনার কম্বো স্লট ({selectedBooks.length}/{maxBooks}টি নির্বাচিত)
          </span>
          {selectedBooks.length > 0 && (
            <button
              onClick={() => setSelectedBookIds([])}
              className="text-[11px] text-destructive hover:underline font-semibold"
            >
              সব খালি করুন
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {slotsArray.slice(0, 3).map((slotIndex) => {
            const book = selectedBooks[slotIndex];
            const isUnlockedTier = slotIndex === maxBooks - 1;

            if (book) {
              return (
                <div
                  key={book.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-card border-2 border-emerald-500/40 shadow-xs relative group transition-all"
                >
                  <img
                    src={book.images?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200'}
                    alt={book.title_bn}
                    className="w-12 h-16 object-cover rounded-md shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-bold text-foreground truncate">{book.title_bn}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{book.author || 'লেখক'}</p>
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ৳{book.price}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSelectBook(book.id)}
                    className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={slotIndex}
                className={`border-2 border-dashed rounded-xl p-3 flex items-center justify-center gap-2 text-center transition-all min-h-[74px] ${
                  isUnlockedTier
                    ? 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-background border flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 opacity-70" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">
                    স্লট {slotIndex + 1}: {isUnlockedTier ? 'মেগা সেভার স্লট' : 'বই নির্বাচন করুন'}
                  </p>
                  <p className="text-[10px] opacity-80">
                    {slotIndex === 0
                      ? 'যেকোনো বই ক্লিক করুন'
                      : slotIndex === 1
                      ? `${tier1Discount}% ছাড় আনলক হবে`
                      : `অতিরিক্ত ${tier2Discount}% ছাড় ও উপহার`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Book Selector & Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Selector Column */}
        <div className="lg:col-span-2 space-y-3">
          {/* Dynamic Database Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-muted/80 text-muted-foreground hover:bg-muted'
              }`}
            >
              সব বই ({availableProducts.length})
            </button>
            {filterCategories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  activeFilter === cat.id
                    ? 'bg-foreground text-background'
                    : 'bg-muted/80 text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat.name_bn}
              </button>
            ))}
            <button
              onClick={() => setActiveFilter('bestseller')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'bestseller'
                  ? 'bg-foreground text-background'
                  : 'bg-muted/80 text-muted-foreground hover:bg-muted'
              }`}
            >
              বেস্টসেলার বই
            </button>
            <button
              onClick={() => setActiveFilter('under_300')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'under_300'
                  ? 'bg-foreground text-background'
                  : 'bg-muted/80 text-muted-foreground hover:bg-muted'
              }`}
            >
              বাজেট ফ্রেন্ডলি (৳৩০০ এর নিচে)
            </button>
          </div>

          {/* Book Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1 p-1">
            {(filteredProducts.length > 0 ? filteredProducts : availableProducts).map((book: any) => {
              const isSelected = selectedBookIds.includes(book.id);
              return (
                <div
                  key={book.id}
                  onClick={() => toggleSelectBook(book.id)}
                  className={`group cursor-pointer rounded-2xl p-2.5 border transition-all duration-200 relative flex flex-col justify-between select-none ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/40 translate-y-[-2px]'
                      : 'border-border/80 bg-card hover:border-primary/50 hover:shadow-sm hover:translate-y-[-2px]'
                  }`}
                >
                  {/* Select check badge */}
                  <div
                    className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm scale-110'
                        : 'bg-background/90 text-muted-foreground border border-border group-hover:border-primary'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>

                  {/* Book Image */}
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted mb-2 relative">
                    <img
                      src={
                        book.images?.[0] ||
                        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80'
                      }
                      alt={book.title_bn}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {book.original_price && book.original_price > book.price && (
                      <span className="absolute bottom-1.5 left-1.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                        ছাড়
                      </span>
                    )}
                  </div>

                  {/* Book Details */}
                  <div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {book.title_bn}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {book.author || 'লেখক'}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="text-xs font-extrabold text-primary">৳{book.price}</span>
                      {book.original_price && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          ৳{book.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Combo Summary Card */}
        <div className="rounded-2xl border-2 border-border/80 bg-card/90 backdrop-blur-xs p-5 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="font-extrabold text-sm sm:text-base text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span>কম্বো মূল্য হিসাব</span>
              </h4>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {selectedBooks.length}টি বই
              </span>
            </div>

            {selectedBooks.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-muted/20 border border-dashed border-border text-muted-foreground text-xs">
                <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="font-bold text-foreground/80">এখনো কোনো বই সিলেক্ট করেননি</p>
                <p className="mt-1 text-[11px]">বাম পাশের ক্যাটালগ থেকে পছন্দের বইগুলোতে ক্লিক করুন</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedBooks.map((b: any, idx: number) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate font-semibold text-foreground">{b.title_bn}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="font-bold text-foreground">৳{b.price}</span>
                      <button
                        onClick={() => toggleSelectBook(b.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-border space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>বইগুলোর মোট মূল্য:</span>
                <span className="font-semibold text-foreground">৳{subtotal}</span>
              </div>

              {selectedBooks.length >= minBooks ? (
                <div className="flex justify-between items-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" /> কম্বো সেভার ছাড় ({currentDiscountPercent}%):
                  </span>
                  <span className="text-sm font-black">-৳{discountAmount}</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold">
                  ⚠️ আর মাত্র {minBooks - selectedBooks.length}টি বই যোগ করলে ইনস্ট্যান্ট {tier1Discount}% ছাড় পাবেন!
                </div>
              )}

              {selectedBooks.length === minBooks && maxBooks > minBooks && (
                <p className="text-[11px] text-primary font-medium">
                  💡 টিপস: {maxBooks}য় বই যোগ করলে পাচ্ছেন {tier2Discount}% মেগা ছাড় ও {giftText}!
                </p>
              )}

              {selectedBooks.length >= maxBooks && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  <Gift className="w-3.5 h-3.5" />
                  <span>অভিনন্দন! {giftText} যুক্ত হয়েছে</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-border">
                <div>
                  <span className="text-sm font-bold text-foreground">সর্বমোট মূল্য:</span>
                  <p className="text-[10px] text-muted-foreground">ক্যাশ অন ডেলিভারি প্রযোজ্য</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">৳{comboTotal}</span>
                  {discountAmount > 0 && (
                    <span className="block text-[10px] text-emerald-600 font-bold">
                      সাশ্রয় ৳{discountAmount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              className="w-full h-11 font-extrabold gap-2 text-sm shadow-md transition-all"
              disabled={selectedBooks.length < minBooks || isAdding}
              onClick={handleAddComboToCart}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>কার্টে যোগ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {selectedBooks.length < minBooks
                      ? `কম্বো বানাতে ${minBooks}টি বই বেছে নিন`
                      : `${buttonText} (${selectedBooks.length}টি বই)`}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
