import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  product_type?: string;
}

interface ProductItem {
  id: string;
  title_bn: string;
  slug: string;
  images: any;
  category_id: string | null;
}

interface DynamicCategoryWithSubcategoriesProps {
  categories: Category[];
  universalCategories?: Category[];
  products?: ProductItem[];
  title?: string;
  subtitle?: string;
  maxParentCategories?: number;
  maxSubcategories?: number;
  columns?: number;
  selectedCategoryIds?: string[];
  selectedSubcategoryIds?: string[];
  useCarousel?: boolean;
  settings?: any;
}

// Fallback book covers for standard categories if image_url is missing
const fallbackCategoryCovers: Record<string, string> = {
  "university-admission": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
  "hsc-higher-secondary": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80",
  "polytechnic-vocational": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80",
  "medical-admission": "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80",
  "kids-stories": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80",
  "kids-age-0-4": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=80",
  "kids-age-12-17": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80",
  "kids-age-4-8": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80",
  "history-culture": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80",
  "palestine-world-history": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
  "archaeological-history": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80",
  "ancient-civilizations": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80",
  "adab-department": "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80",
  "arabic-urdu-dictionary": "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80",
  "arabic-grammar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
  "ulumul-hadith": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80",
  "quran-tafsir": "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80",
  "hadith-sunnah": "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80",
  "seerat-rasool": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80",
  "dua-dhikr": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80",
};

export const DynamicCategoryWithSubcategories: React.FC<DynamicCategoryWithSubcategoriesProps> = ({
  categories,
  universalCategories = [],
  products = [],
  title,
  subtitle,
  maxParentCategories = 8,
  maxSubcategories = 4,
  columns = 4,
  selectedCategoryIds,
  selectedSubcategoryIds,
  useCarousel = true,
  settings = {},
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const allCategories = useMemo(() => {
    return [
      ...categories.map((c) => ({ ...c, _source: "book" as const })),
      ...universalCategories.map((c) => ({
        ...c,
        parent_id: c.parent_id || null,
        _source: "universal" as const,
      })),
    ];
  }, [categories, universalCategories]);

  // Filter parent categories from database
  const parentCategories = useMemo(() => {
    let parents = allCategories.filter((c) => !c.parent_id);
    if (selectedCategoryIds && selectedCategoryIds.length > 0) {
      const selectedParents = selectedCategoryIds
        .map((id) => allCategories.find((c) => c.id === id))
        .filter((c): c is typeof allCategories[0] => Boolean(c && !c.parent_id));
      if (selectedParents.length > 0) {
        parents = selectedParents;
      }
    }
    return parents.slice(0, maxParentCategories);
  }, [allCategories, selectedCategoryIds, maxParentCategories]);

  if (parentCategories.length === 0) return null;

  const getSubItems = (parent: typeof allCategories[0]) => {
    let subs = allCategories.filter((c) => c.parent_id === parent.id);
    if (selectedSubcategoryIds && selectedSubcategoryIds.length > 0) {
      const filteredSubs = subs.filter((s) => selectedSubcategoryIds.includes(s.id));
      if (filteredSubs.length > 0) {
        subs = filteredSubs;
      }
    }
    const items = subs.slice(0, maxSubcategories).map((sub) => {
      const subProduct = products.find((p) => p.category_id === sub.id);
      const productImg =
        Array.isArray(subProduct?.images) && subProduct.images.length > 0
          ? subProduct.images[0]
          : null;
      return {
        id: sub.id,
        name_bn: sub.name_bn,
        link:
          sub._source === "universal" && sub.product_type
            ? `/category/${sub.product_type}/${sub.slug}`
            : `/categories/${sub.slug}`,
        image_url:
          sub.image_url ||
          productImg ||
          fallbackCategoryCovers[sub.slug] ||
          parent.image_url ||
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
      };
    });

    // If a database parent category has fewer subcategories than maxSubcategories, supplement from its products in DB
    if (items.length < maxSubcategories) {
      const parentProducts = products
        .filter((p) => p.category_id === parent.id)
        .slice(0, maxSubcategories - items.length);
      parentProducts.forEach((p) => {
        const img =
          Array.isArray(p.images) && p.images.length > 0
            ? p.images[0]
            : parent.image_url ||
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80";
        items.push({
          id: `prod-${p.id}`,
          name_bn: p.title_bn,
          link: `/product/${p.slug}`,
          image_url: img,
        });
      });
    }

    return items;
  };

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [parentCategories]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const footerText = settings?.footer_text || "সব দেখুন";
  const viewAllLink = settings?.view_all_link || "/categories";
  const viewAllText = settings?.view_all_text || "সব ক্যাটাগরি";

  const renderCard = (parent: typeof allCategories[0]) => {
    const subs = getSubItems(parent);
    const parentLink =
      parent._source === "universal" && parent.product_type
        ? `/category/${parent.product_type}/${parent.slug}`
        : `/categories/${parent.slug}`;

    return (
      <div
        key={parent.id}
        className={cn(
          "bg-card rounded-2xl p-5 border border-slate-200/90 dark:border-border shadow-xs hover:shadow-md transition-all duration-300",
          "flex flex-col justify-between",
          useCarousel
            ? "shrink-0 w-[280px] sm:w-[300px] md:w-[310px] lg:w-[320px]"
            : "w-full"
        )}
      >
        <div>
          {/* Card Header: Category Name */}
          <Link to={parentLink} className="group/title block mb-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
              {parent.name_bn}
            </h3>
          </Link>

          {/* 2x2 Subcategories Grid */}
          {subs.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  to={sub.link}
                  className="group/item flex flex-col items-center"
                >
                  <div className="w-full bg-[#f8f9fa] dark:bg-muted/40 aspect-[3/4] rounded-xl overflow-hidden p-2 flex items-center justify-center border border-slate-100 dark:border-border/40 group-hover/item:border-primary/40 group-hover/item:shadow-sm transition-all duration-300">
                    <img
                      src={sub.image_url}
                      alt={sub.name_bn}
                      className="w-full h-full object-contain rounded-md shadow-xs group-hover/item:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                  <span className="text-xs sm:text-[13px] text-center text-foreground font-medium line-clamp-1 mt-1.5 w-full block group-hover/item:text-primary transition-colors">
                    {sub.name_bn}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Link
              to={parentLink}
              className="h-44 flex flex-col items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded-xl mb-4 p-4 hover:bg-muted/40 transition-colors"
            >
              {parent.image_url && (
                <img
                  src={parent.image_url}
                  alt={parent.name_bn}
                  className="w-20 h-28 object-cover rounded-lg mb-2 shadow-xs"
                />
              )}
              <span className="font-medium text-foreground">{parent.name_bn}</span>
            </Link>
          )}
        </div>

        {/* Card Footer: সব দেখুন > */}
        <div className="pt-2 border-t border-slate-100 dark:border-border/60">
          <Link
            to={parentLink}
            className="inline-flex items-center text-sm font-semibold text-rose-600 hover:text-rose-700 transition-all group/link"
          >
            <span>{footerText}</span>
            <ChevronRight className="w-4 h-4 ml-0.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <section className="mb-10 w-full relative">
      {/* Optional Section Title Header */}
      {title && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 rounded-full bg-primary" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-xs md:text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
          >
            {viewAllText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Cards Wrapper Container */}
      {useCarousel ? (
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              aria-label="পূর্ববর্তী ক্যাটাগরি"
              className="absolute -left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card shadow-lg border border-slate-200 dark:border-border flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 transition-all z-20 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Horizontal Carousel */}
          <div
            ref={scrollContainerRef}
            className="w-full flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-3 pt-1 px-1 items-stretch"
          >
            {parentCategories.map((parent) => renderCard(parent))}
          </div>

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              aria-label="পরবর্তী ক্যাটাগরি"
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card shadow-lg border border-slate-200 dark:border-border flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 transition-all z-20 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", {
            "lg:grid-cols-2": columns === 2,
            "lg:grid-cols-3": columns === 3,
            "lg:grid-cols-4": columns === 4 || !columns,
          })}
        >
          {parentCategories.map((parent) => renderCard(parent))}
        </div>
      )}
    </section>
  );
};
