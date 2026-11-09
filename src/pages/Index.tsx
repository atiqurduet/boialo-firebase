import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { DynamicHeroSlider } from "@/components/DynamicHeroSlider";
import { DynamicCategorySection } from "@/components/DynamicCategorySection";
import { DynamicProductGrid } from "@/components/DynamicProductGrid";
import { DynamicPromoBanner } from "@/components/DynamicPromoBanner";
import { DynamicUniversalProductGrid } from "@/components/DynamicUniversalProductGrid";
import { DynamicUniversalCategorySection } from "@/components/DynamicUniversalCategorySection";
import { DynamicUniversalFlashSale } from "@/components/DynamicUniversalFlashSale";
import { DynamicCategoryWithSubcategories } from "@/components/DynamicCategoryWithSubcategories";
import { DynamicCategoryTopProducts } from "@/components/DynamicCategoryTopProducts";
import { TrustBadges } from "@/components/TrustBadges";
import { FlashSaleSection } from "@/components/FlashSaleSection";
import { CustomComboBuilder } from "@/components/CustomComboBuilder";
import { ScratchCouponModal } from "@/components/ScratchCouponModal";
import { NewsletterSection } from "@/components/NewsletterSection";
import { FeaturedOfferBanner } from "@/components/FeaturedOfferBanner";
import { Footer } from "@/components/Footer";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { AIRecommendations } from "@/components/AIRecommendations";
import { TopSellingProducts } from "@/components/TopSellingProducts";
import { TopAuthorsSection } from "@/components/TopAuthorsSection";
import { TopSellingUniversalProducts } from "@/components/TopSellingUniversalProducts";
import { RecentlySoldProducts } from "@/components/RecentlySoldProducts";
import { OfferProducts } from "@/components/OfferProducts";
import { EbookSection } from "@/components/EbookSection";
import { WeeklyBestBooks } from "@/components/WeeklyBestBooks";
import { WeeklyBestUniversalProducts } from "@/components/WeeklyBestUniversalProducts";
import { BundleShowcase } from "@/components/BundleShowcase";
import { BestSellingBrands } from "@/components/BestSellingBrands";
import { BestSellingPublishers } from "@/components/BestSellingPublishers";
import { PromoTickerMarquee } from "@/components/PromoTickerMarquee";
import { BookOfTheDaySpotlight } from "@/components/BookOfTheDaySpotlight";
import { MidPageSponsorAdBillboard } from "@/components/MidPageSponsorAdBillboard";
import { ReaderCommunityStats } from "@/components/ReaderCommunityStats";
import { StickyBottomAdBar } from "@/components/StickyBottomAdBar";
import { useHomepageData } from "@/hooks/useHomepageData";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { 
    banners, 
    categories, 
    products, 
    universalCategories,
    universalProducts,
    writers,
    sections, 
    loading,
    getProductsByCategory,
    getProductsByCategories,
    getProductsByWriter,
    getProductsByIds,
    getUniversalProductsByCategory,
    getUniversalProductsByType,
    getUniversalCategoriesByType
  } = useHomepageData();

  const featuredProducts = products.filter(p => p.is_featured);
  const preorderProducts = products.filter(p => p.is_preorder === true);
  const newProducts = products.slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <main>
          <Skeleton className="h-[300px] md:h-[450px] w-full" />
          <div className="container py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[72px] rounded-xl" />
              ))}
            </div>
          </div>
          <div className="container py-4 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper to optionally filter products by category_id or category_ids from section settings
  const filterBySettingsCategories = (sourceProducts: typeof products, settings: any) => {
    const catIds: string[] = Array.isArray(settings?.category_ids) && settings.category_ids.length > 0
      ? settings.category_ids
      : settings?.category_id
      ? [settings.category_id]
      : [];
    if (catIds.length === 0) return sourceProducts;
    const allowedIds = new Set(getProductsByCategories(catIds).map(p => p.id));
    return sourceProducts.filter(p => allowedIds.has(p.id));
  };

  // Render section based on type and database configuration
  const renderSection = (section: typeof sections[0], index: number) => {
    const settings = section.settings || {};
    const limit = settings.limit || 10;
    const sectionTitle = settings.hide_title ? '' : section.title_bn;
    const sectionSubtitle = settings.hide_title ? undefined : (section.subtitle_bn || undefined);
    const useCarousel = settings.use_carousel !== false; // default true

    let content: React.ReactNode = null;

    switch (section.section_type) {
      case 'hero_slider':
        return <DynamicHeroSlider key={section.id} banners={banners} />;

      case 'promo_ticker':
        return <PromoTickerMarquee key={section.id} title={sectionTitle} settings={settings} />;

      case 'trust_badges':
        return (
          <div key={section.id} className="container mt-4 mb-2">
            <TrustBadges settings={settings} />
          </div>
        );

      case 'flash_sale':
        return (
          <FlashSaleSection
            key={section.id}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            settings={settings}
          />
        );

      case 'category_grid':
        content = (categories.length > 0 || universalCategories.length > 0) ? (
          <DynamicCategorySection 
            categories={categories}
            universalCategories={universalCategories}
            products={products}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            settings={settings}
          />
        ) : null;
        break;

      case 'book_spotlight': {
        let targetProduct = products[0];
        if (settings.product_id) {
          const found = products.find(p => p.id === settings.product_id);
          if (found) targetProduct = found;
        } else if (settings.category_id) {
          const catProds = getProductsByCategory(settings.category_id);
          if (catProds.length > 0) targetProduct = catProds[0];
        }
        content = (
          <BookOfTheDaySpotlight
            title={sectionTitle}
            subtitle={sectionSubtitle}
            settings={settings}
            product={
              targetProduct
                ? {
                    id: targetProduct.id,
                    title: targetProduct.title_bn,
                    author: targetProduct.author || "জনপ্রিয় লেখক",
                    publisher: targetProduct.publisher || undefined,
                    price: targetProduct.price,
                    originalPrice: targetProduct.original_price || undefined,
                    discount: targetProduct.discount_percent || 20,
                    image:
                      Array.isArray(targetProduct.images) && targetProduct.images.length > 0
                        ? targetProduct.images[0]
                        : "/placeholder.svg",
                    description: targetProduct.description_bn || undefined,
                    slug: targetProduct.slug,
                  }
                : undefined
            }
          />
        );
        break;
      }

      case 'combo_builder':
        content = (
          <CustomComboBuilder
            title={sectionTitle}
            subtitle={sectionSubtitle}
            settings={settings}
          />
        );
        break;

      case 'category_products': {
        const categoryIds: string[] = Array.isArray(settings.category_ids) && settings.category_ids.length > 0
          ? settings.category_ids
          : settings.category_id
          ? [settings.category_id]
          : [];
        if (categoryIds.length === 0) return null;
        const categoryProducts = getProductsByCategories(categoryIds).slice(0, limit);
        const primaryCategory = categories.find(c => c.id === categoryIds[0]);
        if (categoryProducts.length === 0) return null;
        content = (
          <DynamicProductGrid
            products={categoryProducts}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            viewAllLink={settings.view_all_link || `/shop?category=${primaryCategory?.slug || ''}`}
            columns={settings.columns || 5}
            showRanking={settings.show_ranking}
            useCarousel={useCarousel}
          />
        );
        break;
      }

      case 'writer_products': {
        const writerId = settings.writer_id;
        if (!writerId) return null;
        const writerProducts = getProductsByWriter(writerId).slice(0, limit);
        const writer = writers.find(w => w.id === writerId);
        if (writerProducts.length === 0) return null;
        content = (
          <DynamicProductGrid
            products={writerProducts}
            title={sectionTitle}
            subtitle={sectionSubtitle || (writer ? writer.name_bn : undefined)}
            viewAllLink={settings.view_all_link || `/authors/${writer?.slug || ''}`}
            columns={settings.columns || 5}
            useCarousel={useCarousel}
          />
        );
        break;
      }

      case 'selected_products': {
        const productIds: string[] = settings.product_ids || [];
        if (productIds.length === 0) return null;
        const selectedProducts = getProductsByIds(productIds);
        if (selectedProducts.length === 0) return null;
        content = (
          <DynamicProductGrid
            products={selectedProducts}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            viewAllLink={settings.view_all_link}
            columns={settings.columns || 5}
            showRanking={settings.show_ranking}
            useCarousel={useCarousel}
          />
        );
        break;
      }

      case 'new_releases': {
        const filteredNew = filterBySettingsCategories(products, settings);
        content = filteredNew.length > 0 ? (
          <DynamicProductGrid
            products={filteredNew.slice(0, limit)}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            viewAllLink={settings.view_all_link || "/shop?sort=new"}
            columns={settings.columns || 5}
            showRanking={settings.show_ranking}
            useCarousel={useCarousel}
          />
        ) : null;
        break;
      }

      case 'bestsellers': {
        const pool = filterBySettingsCategories(
          featuredProducts.length > 0 ? featuredProducts : products,
          settings
        );
        const bestProducts = (pool.length > 0 ? pool : products).slice(0, limit);
        content = bestProducts.length > 0 ? (
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <DynamicProductGrid
              products={bestProducts}
              title={sectionTitle}
              subtitle={sectionSubtitle}
              viewAllLink={settings.view_all_link || "/shop?sort=bestseller"}
              columns={settings.columns || 5}
              showRanking={settings.show_ranking}
              useCarousel={useCarousel}
            />
          </div>
        ) : null;
        break;
      }

      case 'promo_banner':
        content = <DynamicPromoBanner settings={settings} />;
        break;

      case 'recommended':
      case 'featured_products': {
        const pool = filterBySettingsCategories(
          featuredProducts.length > 0 ? featuredProducts : products,
          settings
        );
        const recProducts = (pool.length > 0 ? pool : products).slice(0, limit);
        content = recProducts.length > 0 ? (
          <DynamicProductGrid
            products={recProducts}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            viewAllLink={settings.view_all_link || "/shop"}
            columns={settings.columns || 5}
            showRanking={settings.show_ranking}
            useCarousel={useCarousel}
          />
        ) : null;
        break;
      }

      case 'preorder_products': {
        const pool = filterBySettingsCategories(preorderProducts, settings);
        if (pool.length === 0) return null;
        content = (
          <DynamicProductGrid
            products={pool.slice(0, limit)}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            viewAllLink={settings.view_all_link || "/shop?preorder=true"}
            columns={settings.columns || 5}
            useCarousel={useCarousel}
          />
        );
        break;
      }

      case 'top_selling_universal_products':
        content = universalProducts.length > 0 ? (
          <TopSellingUniversalProducts
            limit={settings.limit || 10}
            title={sectionTitle || "স্টেশনারি ও লাইফস্টাইল সংগ্রহ"}
            subtitle={sectionSubtitle || "ইসলামিক প্ল্যানার, খাঁটি উদ আতর, মেটালিক বুকমার্ক ও কাঠের রেহাল"}
            useCarousel={useCarousel}
            columns={settings.columns || 5}
            productType={settings.product_type}
          />
        ) : null;
        break;

      case 'top_authors':
        content = (
          <TopAuthorsSection
            limit={settings.limit || 12}
            title={sectionTitle}
            subtitle={sectionSubtitle}
          />
        );
        break;

      case 'billboard':
        content = (
          <MidPageSponsorAdBillboard
            title={sectionTitle}
            subtitle={sectionSubtitle}
            settings={settings}
          />
        );
        break;

      case 'community_stats':
        content = (
          <ReaderCommunityStats
            title={sectionTitle}
            subtitle={sectionSubtitle}
            settings={settings}
          />
        );
        break;

      case 'recently_viewed':
        content = (
          <div className="content-lazy">
            <RecentlyViewed />
          </div>
        );
        break;

      case 'newsletter':
        return (
          <NewsletterSection
            key={section.id}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            settings={settings}
          />
        );

      case 'featured_offer':
        content = <FeaturedOfferBanner />;
        break;

      case 'universal_category_products': {
        const universalCategoryId = settings.universal_category_id;
        const productType = settings.product_type;
        if (!universalCategoryId && !productType) return null;
        
        let uniProducts;
        if (universalCategoryId) {
          uniProducts = getUniversalProductsByCategory(universalCategoryId).slice(0, limit);
        } else {
          uniProducts = getUniversalProductsByType(productType).slice(0, limit);
        }
        
        if (uniProducts.length === 0) return null;
        
        const uniCategory = universalCategories.find(c => c.id === universalCategoryId);
        content = (
          <DynamicUniversalProductGrid
            products={uniProducts}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            viewAllLink={settings.view_all_link || `/${productType || 'lifestyle'}${uniCategory ? `?category=${uniCategory.slug}` : ''}`}
            columns={settings.columns || 5}
            useCarousel={useCarousel}
          />
        );
        break;
      }

      case 'universal_category_grid': {
        const gridProductType = settings.product_type;
        if (!gridProductType) return null;
        
        let typeCategories = getUniversalCategoriesByType(gridProductType);
        if (Array.isArray(settings.universal_category_ids) && settings.universal_category_ids.length > 0) {
          typeCategories = typeCategories.filter(c => settings.universal_category_ids.includes(c.id));
        }
        if (typeCategories.length === 0) return null;
        
        content = (
          <DynamicUniversalCategorySection
            categories={typeCategories}
            title={sectionTitle}
            productType={gridProductType}
            maxCategories={settings.max_categories || 8}
          />
        );
        break;
      }

      case 'universal_flash_sale': {
        const flashProductType = settings.product_type;
        const minDiscount = settings.min_discount || 10;
        
        let flashUniProducts;
        if (flashProductType && flashProductType !== 'all') {
          flashUniProducts = universalProducts
            .filter(p => p.product_type === flashProductType && p.discount_percent && p.discount_percent >= minDiscount)
            .slice(0, limit);
        } else {
          flashUniProducts = universalProducts
            .filter(p => p.discount_percent && p.discount_percent >= minDiscount)
            .slice(0, limit);
        }
        
        if (flashUniProducts.length === 0) return null;
        
        content = (
          <DynamicUniversalFlashSale
            products={flashUniProducts}
            title={sectionTitle}
            viewAllLink={settings.view_all_link || (flashProductType && flashProductType !== 'all' ? `/${flashProductType}` : '/lifestyle')}
            useCarousel={useCarousel}
            columns={settings.columns || 5}
          />
        );
        break;
      }

      case 'ai_recommendations':
        content = (
          <AIRecommendations
            limit={settings.limit || 10}
            columns={settings.columns || 5}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            viewAllLink={settings.view_all_link || "/shop"}
            useCarousel={useCarousel}
          />
        );
        break;

      case 'top_selling_products':
        content = (
          <TopSellingProducts
            limit={settings.limit || 10}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            useCarousel={useCarousel}
            columns={settings.columns || 5}
          />
        );
        break;

      case 'category_subcategory_grid':
        content = (
          <DynamicCategoryWithSubcategories
            categories={categories}
            universalCategories={universalCategories}
            products={products}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            maxParentCategories={settings.max_parent_categories || 8}
            maxSubcategories={settings.max_subcategories || 4}
            columns={settings.columns || 4}
            selectedCategoryIds={settings.category_ids}
            selectedSubcategoryIds={settings.subcategory_ids}
            useCarousel={settings.use_carousel !== false}
            settings={settings}
          />
        );
        break;

      case 'category_top_products':
        content = (
          <DynamicCategoryTopProducts
            categories={categories}
            products={products}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            maxCategories={settings.max_categories || 5}
            productsPerCategory={settings.products_per_category || 6}
            visibleProducts={settings.visible_products || 3}
            selectedCategoryIds={settings.category_ids}
          />
        );
        break;

      case 'recently_sold':
        content = (
          <RecentlySoldProducts
            limit={settings.limit || 10}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            useCarousel={useCarousel}
            columns={settings.columns || 5}
          />
        );
        break;

      case 'offer_products':
        content = (
          <OfferProducts
            limit={settings.limit || 10}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            useCarousel={useCarousel}
            columns={settings.columns || 5}
            minDiscount={settings.min_discount || 5}
          />
        );
        break;

      case 'ebooks':
        content = (
          <EbookSection
            limit={settings.limit || 10}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            useCarousel={useCarousel}
            columns={settings.columns || 5}
          />
        );
        break;

      case 'weekly_best_books':
        content = (
          <WeeklyBestBooks
            limit={settings.limit || 10}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            useCarousel={useCarousel}
            columns={settings.columns || 5}
          />
        );
        break;

      case 'weekly_best_universal':
        content = (
          <WeeklyBestUniversalProducts
            limit={settings.limit || 10}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            useCarousel={useCarousel}
            columns={settings.columns || 5}
          />
        );
        break;

      case 'bundle_showcase':
        content = (
          <BundleShowcase
            limit={settings.limit || 6}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            useCarousel={useCarousel}
            columns={settings.columns || 3}
          />
        );
        break;

      case 'best_selling_brands':
        content = (
          <BestSellingBrands
            limit={settings.limit || 12}
            title={sectionTitle}
            subtitle={sectionSubtitle}
          />
        );
        break;

      case 'best_selling_publishers':
        content = (
          <BestSellingPublishers
            limit={settings.limit || 12}
            title={sectionTitle}
            subtitle={sectionSubtitle}
          />
        );
        break;

      default:
        return null;
    }

    if (!content) return null;

    return (
      <div key={section.id} className={`container ${index > 2 ? 'content-lazy' : ''}`}>
        {content}
      </div>
    );
  };

  const activeSections = sections.filter(s => s.is_active);

  return (
    <div className="min-h-screen bg-background animate-page-in">
      <SEOHead
        title="বইআলো - বাংলাদেশের সবচেয়ে বড় অনলাইন বই ও লাইফস্টাইল শপ"
        description="বইআলো - বাংলাদেশের সবচেয়ে বড় অনলাইন বই ও লাইফস্টাইল শপ। ইসলামি বই, একাডেমিক বই, উপন্যাস, শিশুদের বই সহ হাজার হাজার বই সেরা দামে কিনুন। ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি।"
        keywords="বই, অনলাইন বই, বাংলা বই, ইসলামি বই, বই কিনুন, বইআলো, boialo, online bookshop bangladesh, বই অর্ডার"
        canonicalUrl="https://boialo.com"
      />
      <AnnouncementBar />
      <Header />
      <main className="space-y-6 md:space-y-10">
        {activeSections.length > 0 ? (
          activeSections.map((section, index) => renderSection(section, index))
        ) : (
          <div className="container space-y-12 py-4">
            <DynamicHeroSlider banners={banners} />
            <PromoTickerMarquee />
            <TrustBadges />
            <FlashSaleSection />
            <DynamicProductGrid
              title="নতুন প্রকাশিত বইসমূহ"
              subtitle="বইআলোর সংগ্রহে সদ্য যুক্ত হওয়া সেরা বইসমূহ"
              products={newProducts}
              viewAllLink="/shop?sort=newest"
            />
            <CustomComboBuilder />
            <DynamicCategorySection
              title="জনপ্রিয় ক্যাটাগরি"
              subtitle="আপনার পছন্দের বিষয়ে বই খুঁজুন"
              categories={categories}
              universalCategories={universalCategories}
              products={products}
            />
            <NewsletterSection />
          </div>
        )}
      </main>

      <StickyBottomAdBar />
      <ScratchCouponModal />
      <Footer />
    </div>
  );
};

export default Index;