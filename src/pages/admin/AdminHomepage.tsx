import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GripVertical, Eye, EyeOff, Settings2, Plus, Trash2, Link2, RotateCcw, FolderTree, ExternalLink } from 'lucide-react';
import { BannerImageUpload } from '@/components/admin/BannerImageUpload';
import { DynamicProductSelector } from '@/components/admin/DynamicProductSelector';
import { DynamicCategorySelector } from '@/components/admin/DynamicCategorySelector';

interface HomepageSection {
  id: string;
  section_type: string;
  title_bn: string;
  title_en: string | null;
  subtitle_bn: string | null;
  sort_order: number;
  is_active: boolean;
  settings: any;
}

interface DbCategory {
  id: string;
  name_bn: string;
  name_en?: string;
  slug: string;
  parent_id: string | null;
  image_url?: string | null;
  sort_order?: number;
}

interface DbUniversalCategory {
  id: string;
  name_bn: string;
  name_en?: string;
  product_type: string;
  slug: string;
  parent_id: string | null;
}

interface DbProductType {
  id: string;
  type_key: string;
  name_bn: string;
  name_en: string;
}

const sectionTypeLabels: Record<string, string> = {
  hero_slider: '🖼️ হিরো ব্যানার স্লাইডার',
  promo_ticker: '📢 প্রমোশনাল টিকার',
  trust_badges: '🛡️ ট্রাস্ট ব্যাজ ও নিশ্চয়তা',
  flash_sale: '⚡ লিমিটেড টাইম ফ্ল্যাশ সেল',
  category_subcategory_grid: '🗂️ ক্যাটাগরি ও সাব-ক্যাটাগরি গ্রিড',
  category_grid: '📚 ক্যাটাগরি গ্রিড',
  book_spotlight: '🌟 আজকের বই স্পটলাইট',
  new_releases: '🆕 নতুন প্রকাশিত',
  combo_builder: '🎁 কাস্টম কম্বো সেভার বিল্ডার',
  bestsellers: '🏆 বেস্টসেলার',
  top_selling_universal_products: '📦 লাইফস্টাইল ও স্টেশনারি স্পেশাল',
  top_authors: '👨‍🏫 টপ লেখক',
  promo_banner: '🎯 প্রমো ব্যানার',
  category_products: '📂 ক্যাটাগরি প্রোডাক্ট',
  category_top_products: '🏅 ক্যাটাগরি টপ প্রোডাক্ট',
  writer_products: '✍️ লেখকের বই',
  recommended: '💡 সুপারিশকৃত',
  featured_products: '⭐ ফিচার্ড প্রোডাক্ট',
  selected_products: '📌 সিলেক্টেড প্রোডাক্ট',
  preorder_products: '📅 প্রি-অর্ডার বই',
  universal_category_products: '🛍️ ইউনিভার্সাল ক্যাটাগরি প্রোডাক্ট',
  universal_category_grid: '🏷️ ইউনিভার্সাল ক্যাটাগরি গ্রিড',
  universal_flash_sale: '⚡ ইউনিভার্সাল ফ্ল্যাশ সেল',
  ai_recommendations: '🤖 পাঠকের পছন্দ ও সাজেশন',
  top_selling_products: '🔥 টপ বিক্রিত বই',
  billboard: '🎯 স্পন্সর বিলবোর্ড',
  community_stats: '👥 পাঠক পরিবার ও কমিউনিটি পরিসংখ্যান',
  recently_sold: '🕐 সম্প্রতি বিক্রিত',
  offer_products: '🏷️ অফার প্রোডাক্ট',
  ebooks: '📱 ই-বুক',
  weekly_best_books: '📅 সাপ্তাহিক সেরা বই',
  weekly_best_universal: '📅 সাপ্তাহিক সেরা প্রোডাক্ট',
  bundle_showcase: '📦 বান্ডেল অফার',
  best_selling_brands: '🏢 জনপ্রিয় ব্র্যান্ড',
  best_selling_publishers: '📚 জনপ্রিয় প্রকাশনী',
  recently_viewed: '👁️ সম্প্রতি দেখা বইসমূহ',
  newsletter: '📧 নিউজলেটার সাবস্ক্রিপশন',
};

const sectionTypes = Object.entries(sectionTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

const AdminHomepage = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Dynamic database entities for dropdowns & selectors
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [universalCategories, setUniversalCategories] = useState<DbUniversalCategory[]>([]);
  const [productTypes, setProductTypes] = useState<DbProductType[]>([]);
  const [writers, setWriters] = useState<Array<{ id: string; name_bn: string; slug: string }>>([]);
  const [allProducts, setAllProducts] = useState<Array<{ id: string; title_bn: string; author: string | null; price: number }>>([]);

  const [formData, setFormData] = useState({
    section_type: '',
    title_bn: '',
    title_en: '',
    subtitle_bn: '',
    is_active: true,
    settings: {} as any,
  });

  useEffect(() => {
    fetchSections();
    fetchCategories();
    fetchUniversalCategories();
    fetchProductTypes();
    fetchWriters();
    fetchAllProducts();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name_bn, name_en, slug, parent_id, image_url, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    setCategories((data as DbCategory[]) || []);
  };

  const fetchUniversalCategories = async () => {
    const { data } = await supabase
      .from('universal_categories')
      .select('id, name_bn, name_en, product_type, slug, parent_id')
      .eq('is_active', true)
      .order('name_bn');
    setUniversalCategories((data as DbUniversalCategory[]) || []);
  };

  const fetchProductTypes = async () => {
    const { data } = await supabase
      .from('product_types')
      .select('id, type_key, name_bn, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (data && data.length > 0) {
      setProductTypes(data as DbProductType[]);
    } else {
      setProductTypes([
        { id: 'pt-1', type_key: 'stationery', name_bn: 'স্টেশনারি', name_en: 'Stationery' },
        { id: 'pt-2', type_key: 'lifestyle', name_bn: 'লাইফস্টাইল', name_en: 'Lifestyle' },
        { id: 'pt-3', type_key: 'electronics', name_bn: 'ইলেকট্রনিক্স', name_en: 'Electronics' },
      ]);
    }
  };

  const fetchWriters = async () => {
    const { data } = await supabase
      .from('writers')
      .select('id, name_bn, slug')
      .eq('is_active', true)
      .order('name_bn');
    setWriters(data || []);
  };

  const fetchAllProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, title_bn, author, price')
      .eq('is_active', true)
      .order('title_bn');
    setAllProducts(data || []);
  };

  const parentCategories = categories.filter((c) => !c.parent_id);
  const subCategories = categories.filter((c) => Boolean(c.parent_id));

  const getCategoryDisplayName = (cat: DbCategory) => {
    if (!cat.parent_id) return `📚 ${cat.name_bn}`;
    const parent = categories.find((p) => p.id === cat.parent_id);
    return parent ? `↳ ${parent.name_bn} ➔ ${cat.name_bn}` : `↳ ${cat.name_bn}`;
  };

  // Auto-generate view_all_link based on section type and settings
  const getAutoLink = (sectionType: string, settings: any): string => {
    switch (sectionType) {
      case 'category_products': {
        const catId = settings.category_id || (Array.isArray(settings.category_ids) ? settings.category_ids[0] : '');
        const cat = categories.find((c) => c.id === catId);
        return cat ? `/shop?category=${cat.slug}` : '/shop';
      }
      case 'writer_products': {
        const writer = writers.find((w) => w.id === settings.writer_id);
        return writer ? `/authors/${writer.slug}` : '/authors';
      }
      case 'category_grid':
      case 'category_subcategory_grid':
      case 'category_top_products':
        return '/categories';
      case 'flash_sale':
      case 'universal_flash_sale':
        return '/offers';
      case 'universal_category_products': {
        const uCat = universalCategories.find((c) => c.id === settings.universal_category_id);
        if (uCat) return `/category/${uCat.product_type}/${uCat.slug}`;
        return settings.product_type ? `/${settings.product_type}` : '/shop';
      }
      case 'universal_category_grid':
        return '/categories';
      case 'ebooks':
        return '/digital-library';
      case 'bundle_showcase':
        return '/bundles';
      case 'best_selling_publishers':
        return '/publishers';
      case 'top_authors':
        return '/authors';
      default:
        return '/shop';
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({ title: 'Error', description: 'সেকশন লোড করতে সমস্যা হয়েছে', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSection(null);
    setFormData({
      section_type: 'new_releases',
      title_bn: '',
      title_en: '',
      subtitle_bn: '',
      is_active: true,
      settings: {},
    });
    setDialogOpen(true);
  };

  const handleEdit = (section: HomepageSection) => {
    setIsCreating(false);
    setEditingSection(section);
    setFormData({
      section_type: section.section_type,
      title_bn: section.title_bn,
      title_en: section.title_en || '',
      subtitle_bn: section.subtitle_bn || '',
      is_active: section.is_active,
      settings: section.settings || {},
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isCreating) {
        const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.sort_order)) + 1 : 0;

        const { error } = await supabase.from('homepage_sections').insert({
          section_type: formData.section_type,
          title_bn: formData.title_bn,
          title_en: formData.title_en || null,
          subtitle_bn: formData.subtitle_bn || null,
          is_active: formData.is_active,
          settings: formData.settings,
          sort_order: maxOrder,
        });

        if (error) throw error;
        toast({ title: 'সফল', description: 'নতুন সেকশন যোগ হয়েছে' });
      } else if (editingSection) {
        const { error } = await supabase
          .from('homepage_sections')
          .update({
            section_type: formData.section_type,
            title_bn: formData.title_bn,
            title_en: formData.title_en || null,
            subtitle_bn: formData.subtitle_bn || null,
            is_active: formData.is_active,
            settings: formData.settings,
          })
          .eq('id', editingSection.id);

        if (error) throw error;
        toast({ title: 'সফল', description: 'সেকশন আপডেট হয়েছে' });
      }

      setDialogOpen(false);
      fetchSections();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই সেকশন মুছতে চান?')) return;

    try {
      const { error } = await supabase.from('homepage_sections').delete().eq('id', sectionId);

      if (error) throw error;
      toast({ title: 'সফল', description: 'সেকশন মুছে ফেলা হয়েছে' });
      fetchSections();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleActive = async (section: HomepageSection) => {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ is_active: !section.is_active })
        .eq('id', section.id);

      if (error) throw error;

      toast({
        title: 'সফল',
        description: `সেকশন ${!section.is_active ? 'অ্যাক্টিভ' : 'ইনঅ্যাক্টিভ'} হয়েছে`,
      });
      fetchSections();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const updateSortOrder = async (sectionId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ sort_order: newOrder })
        .eq('id', sectionId);

      if (error) throw error;
      fetchSections();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const currentSection = sections[index];
    const targetSection = sections[newIndex];

    updateSortOrder(currentSection.id, targetSection.sort_order);
    updateSortOrder(targetSection.id, currentSection.sort_order);
  };

  const handleSyncDefaultSections = async () => {
    try {
      setLoading(true);
      const defaultSections = [
        { id: '88888888-8888-4888-8888-888888888800', section_type: 'hero_slider', title_bn: 'হিরো ব্যানার স্লাইডার', title_en: 'Hero Slider', subtitle_bn: 'প্রধান ব্যানারসমূহ', sort_order: 1, is_active: true, settings: {} },
        { id: '88888888-8888-4888-8888-888888888810', section_type: 'promo_ticker', title_bn: 'প্রমোশনাল টিকার', title_en: 'Promo Ticker', subtitle_bn: null, sort_order: 2, is_active: true, settings: {} },
        { id: '88888888-8888-4888-8888-888888888808', section_type: 'trust_badges', title_bn: 'কেন আমাদের থেকে কিনবেন', title_en: 'Why Choose Us', subtitle_bn: null, sort_order: 3, is_active: true, settings: {} },
        { id: '88888888-8888-4888-8888-888888888801', section_type: 'flash_sale', title_bn: 'আজকের লিমিটেড টাইম ফ্ল্যাশ সেল', title_en: 'Flash Sale', subtitle_bn: 'সীমিত সময়ের জন্য বিশেষ মেগা ছাড় — স্টক শেষ হওয়ার আগেই অর্ডার করুন', sort_order: 4, is_active: true, settings: { min_discount: 20, limit: 4 } },
        { id: '88888888-8888-4888-8888-888888888817', section_type: 'category_subcategory_grid', title_bn: 'বিষয়ভিত্তিক ও একাডেমিক ক্যাটাগরি', title_en: 'Subject & Academic Categories', subtitle_bn: 'আপনার পছন্দের বিভাগ ও সাব-ক্যাটাগরি থেকে বই নির্বাচন করুন', sort_order: 5, is_active: true, settings: { max_parent_categories: 8, max_subcategories: 4, columns: 4, use_carousel: true } },
        { id: '88888888-8888-4888-8888-888888888802', section_type: 'category_grid', title_bn: 'জনপ্রিয় ক্যাটাগরি', title_en: 'Popular Categories', subtitle_bn: 'সব ধরনের বই এক জায়গায়', sort_order: 6, is_active: true, settings: { max_categories: 12 } },
        { id: '88888888-8888-4888-8888-888888888811', section_type: 'book_spotlight', title_bn: 'আজকের সেরা বই স্পটলাইট', title_en: 'Book of the Day Spotlight', subtitle_bn: 'এই সপ্তাহের সবচেয়ে আলোচিত ও পাঠকপ্রিয় গ্রন্থ', sort_order: 7, is_active: true, settings: {} },
        { id: '88888888-8888-4888-8888-888888888803', section_type: 'new_releases', title_bn: 'নতুন প্রকাশিত বই', title_en: 'New Releases', subtitle_bn: 'সদ্য প্রকাশিত বইসমূহ', sort_order: 8, is_active: true, settings: { limit: 8 } },
        { id: '88888888-8888-4888-8888-888888888812', section_type: 'combo_builder', title_bn: 'কাস্টম কম্বো সেভার বিল্ডার', title_en: 'Custom Combo Saver Builder', subtitle_bn: 'যেকোনো ২টি বইয়ে ১০% ছাড় এবং ৩টি বইয়ে ১৫% মেগা ছাড় সাথে ফ্রি উপহার!', sort_order: 9, is_active: true, settings: { discount_percent: 10, tier2_discount: 15, enabled: true } },
        { id: '88888888-8888-4888-8888-888888888804', section_type: 'bestsellers', title_bn: 'বইমেলা বেস্টসেলার', title_en: 'Bestsellers', subtitle_bn: 'সবচেয়ে জনপ্রিয় বইসমূহ', sort_order: 10, is_active: true, settings: { limit: 8 } },
        { id: '88888888-8888-4888-8888-888888888813', section_type: 'top_selling_universal_products', title_bn: 'স্টেশনারি ও লাইফস্টাইল সংগ্রহ', title_en: 'Lifestyle & Stationery', subtitle_bn: 'ইসলামিক প্ল্যানার, খাঁটি উদ আতর, মেটালিক বুকমার্ক ও কাঠের রেহাল', sort_order: 11, is_active: true, settings: { limit: 8 } },
        { id: '88888888-8888-4888-8888-888888888805', section_type: 'top_authors', title_bn: 'জনপ্রিয় লেখকবৃন্দ', title_en: 'Top Authors', subtitle_bn: 'পাঠকপ্রিয় লেখকদের বই', sort_order: 12, is_active: true, settings: { limit: 6 } },
        { id: '88888888-8888-4888-8888-888888888806', section_type: 'promo_banner', title_bn: 'প্রমোশনাল ব্যানার', title_en: 'Promo Banner', subtitle_bn: 'বিশেষ অফার', sort_order: 13, is_active: true, settings: { title: 'প্রিমিয়াম বুকমার্ক ফ্রি!', description: '৪৯৯+ টাকার অর্ডারে ক্যালিগ্রাফি বুকমার্ক ফ্রি!', button_text: 'এখনই কিনুন', button_link: '/shop', badge_text: 'সীমিত সময়ের অফার' } },
        { id: '88888888-8888-4888-8888-888888888814', section_type: 'billboard', title_bn: 'বিশেষ পার্টনার ও স্পন্সরড অফারসমূহ', title_en: 'Sponsor Billboard', subtitle_bn: 'Sponsored', sort_order: 14, is_active: true, settings: {} },
        { id: '88888888-8888-4888-8888-888888888815', section_type: 'community_stats', title_bn: 'পাঠক পরিবার ও কমিউনিটি পরিসংখ্যান', title_en: 'Reader Community Stats', subtitle_bn: 'হাজারো সন্তুষ্ট পাঠকের আস্থার ঠিকানা', sort_order: 15, is_active: true, settings: {} },
        { id: '88888888-8888-4888-8888-888888888816', section_type: 'recently_viewed', title_bn: 'সম্প্রতি দেখা বইসমূহ', title_en: 'Recently Viewed', subtitle_bn: null, sort_order: 16, is_active: true, settings: {} },
        { id: '88888888-8888-4888-8888-888888888809', section_type: 'newsletter', title_bn: 'নিউজলেটার সাবস্ক্রাইব করুন', title_en: 'Newsletter', subtitle_bn: 'নতুন বই ও অফারের আপডেট পেতে সাবস্ক্রাইব করুন', sort_order: 17, is_active: true, settings: {} },
      ];

      const existingTypes = new Set(sections.map((s) => s.section_type));
      let addedCount = 0;

      for (const def of defaultSections) {
        if (!existingTypes.has(def.section_type)) {
          await supabase.from('homepage_sections').insert(def);
          addedCount++;
        }
      }

      toast({
        title: 'সফল',
        description: addedCount > 0 ? `${addedCount}টি নতুন সেকশন যোগ করা হয়েছে` : 'সবগুলো প্রধান সেকশন ইতোমধ্যে যুক্ত রয়েছে',
      });
      await fetchSections();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const renderSmartLinkField = (sectionType: string) => {
    const autoLink = getAutoLink(sectionType, formData.settings);
    return (
      <div>
        <Label className="flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" /> View All / সব দেখুন লিংক
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={formData.settings.view_all_link || ''}
            onChange={(e) => updateSetting('view_all_link', e.target.value)}
            placeholder={`অটো: ${autoLink}`}
          />
          {formData.settings.view_all_link && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              title="অটো লিংক ব্যবহার করুন"
              onClick={() => updateSetting('view_all_link', '')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          খালি রাখলে অটো লিংক: <span className="font-medium text-primary">{autoLink}</span>
        </p>
      </div>
    );
  };

  const renderSettingsEditor = () => {
    const sectionType = formData.section_type;
    if (!sectionType) return null;

    switch (sectionType) {
      case 'hero_slider':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">🖼️ হিরো স্লাইডার সেটিংস</h4>
              <Link
                to="/admin/banners"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                ব্যানার যোগ/এডিট করুন <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>স্লাইড পরিবর্তনের সময় (সেকেন্ড)</Label>
                <Input
                  type="number"
                  min={2}
                  max={15}
                  value={formData.settings.autoplay_seconds || 5}
                  onChange={(e) => updateSetting('autoplay_seconds', Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.settings.autoplay !== false}
                  onCheckedChange={(checked) => updateSetting('autoplay', checked)}
                />
                <Label>অটোপ্লে চালু রাখুন</Label>
              </div>
            </div>
          </div>
        );

      case 'promo_ticker': {
        const tickerItems: Array<{ badge?: string; text: string; link?: string }> =
          Array.isArray(formData.settings.items) && formData.settings.items.length > 0
            ? formData.settings.items
            : [
                { badge: 'হট ডিল', text: 'আজ মধ্যরাত পর্যন্ত বিশেষ ফ্ল্যাশ সেল চলছে! কুপন কোড: BOOK15', link: '/offers' },
                { badge: 'ফ্রি ডেলিভারি', text: 'সমগ্র বাংলাদেশে ৪৯৯৳ বা তদূর্ধ্ব অর্ডারে নিশ্চিত ফ্রি ডেলিভারি!', link: '/shop' },
                { badge: 'গিফট অফার', text: 'প্রতিটি অর্ডারে বিশেষ উপহার হিসেবে পাচ্ছেন প্রিমিয়াম ক্যালিগ্রাফি বুকমার্ক', link: '/offers' },
              ];

        const updateTickerItem = (idx: number, field: string, val: string) => {
          const next = tickerItems.map((item, i) => (i === idx ? { ...item, [field]: val } : item));
          updateSetting('items', next);
        };

        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">📢 প্রমোশনাল টিকার সেটিংস</h4>
            <div>
              <Label>বাম পাশের লেবেল টেক্সট</Label>
              <Input
                value={formData.settings.label_text || 'তাজা অফার:'}
                onChange={(e) => updateSetting('label_text', e.target.value)}
                placeholder="তাজা অফার:"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>টিকার মেসেজ তালিকা</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateSetting('items', [...tickerItems, { badge: 'নতুন অফার', text: '', link: '/offers' }])
                  }
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> নতুন মেসেজ যোগ করুন
                </Button>
              </div>
              {tickerItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      className="w-36 h-8 text-xs"
                      placeholder="ব্যাজ (যেমন: হট ডিল)"
                      value={item.badge || ''}
                      onChange={(e) => updateTickerItem(idx, 'badge', e.target.value)}
                    />
                    <Input
                      className="flex-1 h-8 text-xs"
                      placeholder="লিংক (/offers)"
                      value={item.link || ''}
                      onChange={(e) => updateTickerItem(idx, 'link', e.target.value)}
                    />
                    {tickerItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => updateSetting('items', tickerItems.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <Input
                    className="h-8 text-xs"
                    placeholder="টিকারের মূল বার্তা লিখুন..."
                    value={item.text || ''}
                    onChange={(e) => updateTickerItem(idx, 'text', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'trust_badges': {
        const badges: Array<{ title: string; subtitle: string }> =
          Array.isArray(formData.settings.badges) && formData.settings.badges.length > 0
            ? formData.settings.badges
            : [
                { title: 'পার্সেল ওপেন গ্যারান্টি', subtitle: 'ডেলিভারি ম্যানের সামনে পার্সেল খুলে দেখে নেওয়ার সুযোগ' },
                { title: '৭ দিনের রিটার্ন', subtitle: 'ত্রুটিযুক্ত বইয়ে ফ্রি এক্সচেঞ্জ' },
                { title: '১০০% আসল বই', subtitle: 'সরাসরি মূল প্রকাশনী থেকে' },
                { title: 'ক্যাশ অন ডেলিভারি', subtitle: 'বই হাতে পেয়ে মূল্য পরিশোধ' },
              ];

        const updateBadge = (idx: number, field: 'title' | 'subtitle', val: string) => {
          const next = badges.map((b, i) => (i === idx ? { ...b, [field]: val } : b));
          updateSetting('badges', next);
        };

        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🛡️ ট্রাস্ট ব্যাজসমূহ কাস্টমাইজ করুন</h4>
            <div className="grid grid-cols-1 gap-3">
              {badges.map((badge, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">ব্যাজ #{idx + 1} শিরোনাম</Label>
                    <Input
                      className="h-8 text-xs mt-1"
                      value={badge.title}
                      onChange={(e) => updateBadge(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">সাবটাইটেল / বিবরণ</Label>
                    <Input
                      className="h-8 text-xs mt-1"
                      value={badge.subtitle}
                      onChange={(e) => updateBadge(idx, 'subtitle', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'flash_sale':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">⚡ লিমিটেড টাইম ফ্ল্যাশ সেল সেটিংস</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label>মিনিমাম ডিসকাউন্ট (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  value={formData.settings.min_discount ?? 20}
                  onChange={(e) => updateSetting('min_discount', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>প্রোডাক্ট সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={24}
                  value={formData.settings.limit || 4}
                  onChange={(e) => updateSetting('limit', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>কলাম সংখ্যা</Label>
                <Select
                  value={String(formData.settings.columns || 4)}
                  onValueChange={(v) => updateSetting('columns', Number(v))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">৩ কলাম</SelectItem>
                    <SelectItem value="4">৪ কলাম</SelectItem>
                    <SelectItem value="5">৫ কলাম</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ব্যাজ টেক্সট</Label>
                <Input
                  value={formData.settings.badge_text || ''}
                  onChange={(e) => updateSetting('badge_text', e.target.value)}
                  placeholder="লিমিটেড টাইম ফ্ল্যাশ সেল"
                />
              </div>
              <div>
                <Label>কাউন্টডাউন ঘণ্টা</Label>
                <Input
                  type="number"
                  min={1}
                  max={72}
                  value={formData.settings.countdown_hours || 6}
                  onChange={(e) => updateSetting('countdown_hours', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>অর্ডার বাটন টেক্সট</Label>
                <Input
                  value={formData.settings.button_text || ''}
                  onChange={(e) => updateSetting('button_text', e.target.value)}
                  placeholder="১-ক্লিকে অর্ডার"
                />
              </div>
              <div>
                <Label>View All বাটন টেক্সট</Label>
                <Input
                  value={formData.settings.view_all_text || ''}
                  onChange={(e) => updateSetting('view_all_text', e.target.value)}
                  placeholder="সবগুলো ফ্ল্যাশ ডিল দেখুন"
                />
              </div>
            </div>

            {renderSmartLinkField(sectionType)}

            <div>
              <Label>ডাটাবেস ক্যাটাগরি দিয়ে ফ্ল্যাশ সেল ফিল্টার করুন (ঐচ্ছিক)</Label>
              <DynamicCategorySelector
                selectedIds={formData.settings.category_ids || []}
                onChange={(ids) => updateSetting('category_ids', ids)}
              />
            </div>

            <div>
              <Label>অথবা নির্দিষ্ট প্রোডাক্ট নির্বাচন করুন (ঐচ্ছিক)</Label>
              <DynamicProductSelector
                selectedIds={formData.settings.product_ids || []}
                onChange={(ids) => updateSetting('product_ids', ids)}
              />
            </div>
          </div>
        );

      case 'book_spotlight':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🌟 আজকের বই স্পটলাইট সেটিংস</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>স্পটলাইট বই নির্বাচন করুন (ডাটাবেস থেকে)</Label>
                <Select
                  value={formData.settings.product_id || 'auto'}
                  onValueChange={(val) => updateSetting('product_id', val === 'auto' ? '' : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="অটো (প্রথম বেস্টসেলার বই)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">✨ অটো (প্রথম বেস্টসেলার বই)</SelectItem>
                    {allProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title_bn} — ৳{p.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>অথবা ক্যাটাগরি থেকে অটো স্পটলাইট (ডাটাবেস)</Label>
                <Select
                  value={formData.settings.category_id || 'all'}
                  onValueChange={(val) => updateSetting('category_id', val === 'all' ? '' : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="সব ক্যাটাগরি" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {getCategoryDisplayName(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>টপ ব্যাজ টেক্সট</Label>
                <Input
                  value={formData.settings.badge_text || ''}
                  onChange={(e) => updateSetting('badge_text', e.target.value)}
                  placeholder="আজকের সেরা নির্বাচিত বই (Editor's Pick)"
                />
              </div>
              <div>
                <Label>র‍্যাংকিং টেক্সট</Label>
                <Input
                  value={formData.settings.rank_text || ''}
                  onChange={(e) => updateSetting('rank_text', e.target.value)}
                  placeholder="#১ বেস্টসেলার"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>স্টক অ্যালার্ট টেক্সট</Label>
                <Input
                  value={formData.settings.stock_left_text || ''}
                  onChange={(e) => updateSetting('stock_left_text', e.target.value)}
                  placeholder="আর মাত্র ১৪টি কপি"
                />
              </div>
              <div>
                <Label>স্টক বার (%)</Label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={formData.settings.stock_progress ?? 82}
                  onChange={(e) => updateSetting('stock_progress', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>কাউন্টডাউন (ঘণ্টা)</Label>
                <Input
                  type="number"
                  min={1}
                  max={48}
                  value={formData.settings.countdown_hours ?? 14}
                  onChange={(e) => updateSetting('countdown_hours', Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label>কাস্টম কোট / সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</Label>
              <Textarea
                rows={2}
                value={formData.settings.custom_description || ''}
                onChange={(e) => updateSetting('custom_description', e.target.value)}
                placeholder="খালি রাখলে বইয়ের মূল বিবরণ দেখাবে..."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>প্রাইমারি বাটন</Label>
                <Input
                  value={formData.settings.primary_btn_text || ''}
                  onChange={(e) => updateSetting('primary_btn_text', e.target.value)}
                  placeholder="১-ক্লিকে দ্রুত অর্ডার"
                />
              </div>
              <div>
                <Label>কার্ট বাটন</Label>
                <Input
                  value={formData.settings.secondary_btn_text || ''}
                  onChange={(e) => updateSetting('secondary_btn_text', e.target.value)}
                  placeholder="কার্টে যোগ"
                />
              </div>
              <div>
                <Label>প্রিভিউ বাটন</Label>
                <Input
                  value={formData.settings.preview_btn_text || ''}
                  onChange={(e) => updateSetting('preview_btn_text', e.target.value)}
                  placeholder="একটু পড়ে দেখুন"
                />
              </div>
            </div>
          </div>
        );

      case 'combo_builder':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🎁 কাস্টম কম্বো সেভার বিল্ডার সেটিংস</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label>২টি বইয়ের ছাড় (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.settings.discount_percent ?? 10}
                  onChange={(e) => updateSetting('discount_percent', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>৩+ বইয়ের মেগা ছাড় (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={70}
                  value={formData.settings.tier2_discount ?? 15}
                  onChange={(e) => updateSetting('tier2_discount', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>সর্বনিম্ন বই সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={5}
                  value={formData.settings.min_books ?? 2}
                  onChange={(e) => updateSetting('min_books', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>সর্বোচ্চ বই সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={formData.settings.max_books ?? 4}
                  onChange={(e) => updateSetting('max_books', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>ব্যাজ টেক্সট</Label>
                <Input
                  value={formData.settings.badge_text || ''}
                  onChange={(e) => updateSetting('badge_text', e.target.value)}
                  placeholder="কাস্টম কম্বো সেভার বিল্ডার"
                />
              </div>
              <div>
                <Label>উপহার বার্তা</Label>
                <Input
                  value={formData.settings.gift_text || ''}
                  onChange={(e) => updateSetting('gift_text', e.target.value)}
                  placeholder="ফ্রি প্রিমিয়াম বুকমার্ক সেট আনলকড!"
                />
              </div>
              <div>
                <Label>অর্ডার বাটন টেক্সট</Label>
                <Input
                  value={formData.settings.button_text || ''}
                  onChange={(e) => updateSetting('button_text', e.target.value)}
                  placeholder="কম্বো প্যাক কার্টে যোগ করুন"
                />
              </div>
            </div>

            <div>
              <Label>ডাটাবেস ক্যাটাগরি নির্বাচন করুন (খালি রাখলে সব ক্যাটাগরি ট্যাব দেখাবে)</Label>
              <DynamicCategorySelector
                selectedIds={formData.settings.category_ids || []}
                onChange={(ids) => updateSetting('category_ids', ids)}
                includeUniversal={false}
              />
            </div>

            <div>
              <Label>অথবা কম্বোর জন্য নির্দিষ্ট বই নির্বাচন করুন (ঐচ্ছিক)</Label>
              <DynamicProductSelector
                selectedIds={formData.settings.product_ids || []}
                onChange={(ids) => updateSetting('product_ids', ids)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.settings.enabled !== false}
                onCheckedChange={(checked) => updateSetting('enabled', checked)}
              />
              <Label>কম্বো বিল্ডার কার্যকর রাখুন</Label>
            </div>
          </div>
        );

      case 'category_products':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">📂 ক্যাটাগরি প্রোডাক্ট সেটিংস (ডাটাবেস ক্যাটাগরি)</h4>
            <div>
              <Label>প্রধান ক্যাটাগরি নির্বাচন করুন (মূল বা সাব-ক্যাটাগরি)</Label>
              <Select
                value={formData.settings.category_id || ''}
                onValueChange={(value) => updateSetting('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ডাটাবেস থেকে ক্যাটাগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((parent) => {
                    const children = subCategories.filter((s) => s.parent_id === parent.id);
                    return [
                      <SelectItem key={parent.id} value={parent.id} className="font-semibold">
                        📚 {parent.name_bn} (মূল ক্যাটাগরি)
                      </SelectItem>,
                      ...children.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id} className="pl-6">
                          ↳ {parent.name_bn} ➔ {sub.name_bn}
                        </SelectItem>
                      )),
                    ];
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>অথবা একাধিক ডাটাবেস ক্যাটাগরি/সাব-ক্যাটাগরি একসাথে নির্বাচন করুন</Label>
              <DynamicCategorySelector
                selectedIds={formData.settings.category_ids || []}
                onChange={(ids) => updateSetting('category_ids', ids)}
                includeUniversal={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>প্রোডাক্ট সংখ্যা</Label>
                <Input
                  type="number"
                  value={formData.settings.limit || 10}
                  onChange={(e) => updateSetting('limit', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>কলাম সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={6}
                  value={formData.settings.columns || 5}
                  onChange={(e) => updateSetting('columns', Number(e.target.value))}
                />
              </div>
            </div>
            {renderSmartLinkField(sectionType)}
          </div>
        );

      case 'category_grid':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">📚 ক্যাটাগরি গ্রিড সেটিংস (ডাটাবেস থেকে)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>সর্বোচ্চ ক্যাটাগরি সংখ্যা</Label>
                <Input
                  type="number"
                  min={4}
                  max={30}
                  value={formData.settings.max_categories || 12}
                  onChange={(e) => updateSetting('max_categories', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>ইমেজ সাইজ</Label>
                <Select
                  value={formData.settings.image_size || 'medium'}
                  onValueChange={(value) => updateSetting('image_size', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="সাইজ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">ছোট (৬০px)</SelectItem>
                    <SelectItem value="medium">মাঝারি (৮০px)</SelectItem>
                    <SelectItem value="large">বড় (১০০px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>ডাটাবেস থেকে নির্দিষ্ট ক্যাটাগরি নির্বাচন করুন (খালি রাখলে সব ক্যাটাগরি দেখাবে)</Label>
              <DynamicCategorySelector
                selectedIds={formData.settings.category_ids || []}
                onChange={(ids) => updateSetting('category_ids', ids)}
              />
            </div>

            {renderSmartLinkField(sectionType)}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.settings.show_product_count !== false}
                  onCheckedChange={(checked) => updateSetting('show_product_count', checked)}
                />
                <Label>পণ্য সংখ্যা দেখান</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.settings.show_subcategory_indicator !== false}
                  onCheckedChange={(checked) => updateSetting('show_subcategory_indicator', checked)}
                />
                <Label>সাব-ক্যাটাগরি ইনডিকেটর</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.settings.show_subcategories || false}
                  onCheckedChange={(checked) => updateSetting('show_subcategories', checked)}
                />
                <Label>সাব-ক্যাটাগরিগুলোও সরাসরি দেখান</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.settings.enable_scroll_arrows !== false}
                  onCheckedChange={(checked) => updateSetting('enable_scroll_arrows', checked)}
                />
                <Label>স্ক্রল অ্যারো দেখান</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.settings.gradient_border || false}
                  onCheckedChange={(checked) => updateSetting('gradient_border', checked)}
                />
                <Label>গ্র্যাডিয়েন্ট বর্ডার</Label>
              </div>
            </div>
          </div>
        );

      case 'category_subcategory_grid': {
        const selectedCatIds: string[] = formData.settings.category_ids || [];
        const selectedSubIds: string[] = formData.settings.subcategory_ids || [];

        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🗂️ ক্যাটাগরি ও সাব-ক্যাটাগরি গ্রিড সেটিংস (ডাটাবেস)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>প্যারেন্ট কার্ড সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={16}
                  value={formData.settings.max_parent_categories || 8}
                  onChange={(e) => updateSetting('max_parent_categories', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>প্রতি কার্ডে সাব-ক্যাটাগরি</Label>
                <Input
                  type="number"
                  min={2}
                  max={8}
                  value={formData.settings.max_subcategories || 4}
                  onChange={(e) => updateSetting('max_subcategories', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>কলাম সংখ্যা</Label>
                <Select
                  value={String(formData.settings.columns || 4)}
                  onValueChange={(value) => updateSetting('columns', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">২ কলাম</SelectItem>
                    <SelectItem value="3">৩ কলাম</SelectItem>
                    <SelectItem value="4">৪ কলাম</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>কার্ড ফুটার লিংক টেক্সট</Label>
                <Input
                  value={formData.settings.footer_text || ''}
                  onChange={(e) => updateSetting('footer_text', e.target.value)}
                  placeholder="সব দেখুন"
                />
              </div>
              <div>
                <Label>সেকশন View All টেক্সট</Label>
                <Input
                  value={formData.settings.view_all_text || ''}
                  onChange={(e) => updateSetting('view_all_text', e.target.value)}
                  placeholder="সব ক্যাটাগরি"
                />
              </div>
            </div>

            {renderSmartLinkField(sectionType)}

            <div>
              <Label>১. ডাটাবেস থেকে মূল (Parent) ক্যাটাগরি নির্বাচন করুন ({parentCategories.length + universalCategories.length}টি উপলব্ধ)</Label>
              <p className="text-xs text-muted-foreground mb-1.5">খালি রাখলে ডাটাবেসের সব মূল ক্যাটাগরি ক্রমানুসারে দেখাবে</p>
              <div className="border rounded-lg max-h-52 overflow-y-auto p-1.5 space-y-1 bg-background">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50 rounded">
                  📚 বইয়ের মূল ক্যাটাগরি ({parentCategories.length}টি)
                </div>
                {parentCategories.map((cat) => {
                  const childCount = subCategories.filter((s) => s.parent_id === cat.id).length;
                  return (
                    <label key={cat.id} className="flex items-center justify-between gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedCatIds.includes(cat.id)}
                          onCheckedChange={(checked) => {
                            const newIds = checked ? [...selectedCatIds, cat.id] : selectedCatIds.filter((id) => id !== cat.id);
                            updateSetting('category_ids', newIds);
                          }}
                        />
                        <span className="text-sm font-medium">{cat.name_bn}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {childCount}টি সাব-ক্যাটাগরি
                      </Badge>
                    </label>
                  );
                })}

                {universalCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                      🛍️ ইউনিভার্সাল ক্যাটাগরি ({universalCategories.length}টি)
                    </div>
                    {universalCategories.map((cat) => (
                      <label key={cat.id} className="flex items-center justify-between gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedCatIds.includes(cat.id)}
                            onCheckedChange={(checked) => {
                              const newIds = checked ? [...selectedCatIds, cat.id] : selectedCatIds.filter((id) => id !== cat.id);
                              updateSetting('category_ids', newIds);
                            }}
                          />
                          <span className="text-sm">{cat.name_bn}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {cat.product_type}
                        </Badge>
                      </label>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div>
              <Label>২. ডাটাবেস থেকে নির্দিষ্ট সাব-ক্যাটাগরি ফিল্টার করুন ({subCategories.length}টি সাব-ক্যাটাগরি উপলব্ধ)</Label>
              <p className="text-xs text-muted-foreground mb-1.5">খালি রাখলে প্রতিটি মূল ক্যাটাগরির সব সাব-ক্যাটাগরি স্বয়ংক্রিয়ভাবে দেখাবে</p>
              <div className="border rounded-lg max-h-56 overflow-y-auto p-1.5 space-y-1 bg-background">
                {parentCategories.map((parent) => {
                  const children = subCategories.filter((s) => s.parent_id === parent.id);
                  if (children.length === 0) return null;
                  return (
                    <div key={parent.id} className="space-y-0.5">
                      <div className="px-2 py-1 text-xs font-bold text-primary bg-primary/5 rounded flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5" /> {parent.name_bn}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-3 py-1">
                        {children.map((sub) => (
                          <label key={sub.id} className="flex items-center gap-2 p-1.5 hover:bg-muted rounded cursor-pointer text-xs">
                            <Checkbox
                              checked={selectedSubIds.includes(sub.id)}
                              onCheckedChange={(checked) => {
                                const newIds = checked
                                  ? [...selectedSubIds, sub.id]
                                  : selectedSubIds.filter((id) => id !== sub.id);
                                updateSetting('subcategory_ids', newIds);
                              }}
                            />
                            <span className="truncate">{sub.name_bn}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'category_top_products':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🏅 ক্যাটাগরি টপ প্রোডাক্ট সেটিংস</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>ক্যাটাগরি সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={12}
                  value={formData.settings.max_categories || 5}
                  onChange={(e) => updateSetting('max_categories', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>প্রতি কার্ডে মোট বই</Label>
                <Input
                  type="number"
                  min={2}
                  max={20}
                  value={formData.settings.products_per_category || 6}
                  onChange={(e) => updateSetting('products_per_category', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>একসাথে দৃশ্যমান বই</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.settings.visible_products || 3}
                  onChange={(e) => updateSetting('visible_products', Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label>ডাটাবেস থেকে ক্যাটাগরি নির্বাচন করুন (মূল বা সাব-ক্যাটাগরি)</Label>
              <DynamicCategorySelector
                selectedIds={formData.settings.category_ids || []}
                onChange={(ids) => updateSetting('category_ids', ids)}
              />
            </div>
          </div>
        );

      case 'writer_products':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">✍️ লেখকের বই সেটিংস</h4>
            <div>
              <Label>লেখক নির্বাচন করুন (ডাটাবেস থেকে)</Label>
              <Select
                value={formData.settings.writer_id || ''}
                onValueChange={(value) => updateSetting('writer_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="লেখক নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {writers.map((writer) => (
                    <SelectItem key={writer.id} value={writer.id}>
                      {writer.name_bn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>প্রোডাক্ট সংখ্যা</Label>
                <Input
                  type="number"
                  value={formData.settings.limit || 10}
                  onChange={(e) => updateSetting('limit', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>কলাম সংখ্যা</Label>
                <Input
                  type="number"
                  value={formData.settings.columns || 5}
                  onChange={(e) => updateSetting('columns', Number(e.target.value))}
                />
              </div>
            </div>
            {renderSmartLinkField(sectionType)}
          </div>
        );

      case 'selected_products':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">📌 সিলেক্টেড প্রোডাক্ট সেটিংস</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>কলাম সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={6}
                  value={formData.settings.columns || 5}
                  onChange={(e) => updateSetting('columns', Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.settings.show_ranking || false}
                  onCheckedChange={(checked) => updateSetting('show_ranking', checked)}
                />
                <Label>র‍্যাংকিং ব্যাজ দেখান</Label>
              </div>
            </div>
            {renderSmartLinkField(sectionType)}
            <div>
              <Label>ডাটাবেস ক্যাটাগরি দিয়ে ফিল্টার করুন</Label>
              <DynamicCategorySelector
                selectedIds={formData.settings.category_ids || []}
                onChange={(ids) => updateSetting('category_ids', ids)}
              />
            </div>
            <div>
              <Label>ডাটাবেস থেকে প্রোডাক্ট নির্বাচন করুন</Label>
              <DynamicProductSelector
                selectedIds={formData.settings.product_ids || []}
                onChange={(ids) => updateSetting('product_ids', ids)}
              />
            </div>
          </div>
        );

      case 'universal_category_products':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🛍️ ইউনিভার্সাল ক্যাটাগরি প্রোডাক্ট সেটিংস (ডাটাবেস)</h4>
            <div>
              <Label>প্রোডাক্ট টাইপ (ডাটাবেস থেকে)</Label>
              <Select
                value={formData.settings.product_type || ''}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, product_type: value, universal_category_id: '' },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="প্রোডাক্ট টাইপ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((pt) => (
                    <SelectItem key={pt.id} value={pt.type_key}>
                      🛍️ {pt.name_bn} ({pt.name_en})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ইউনিভার্সাল ক্যাটাগরি নির্বাচন করুন (ডাটাবেস থেকে)</Label>
              <Select
                value={formData.settings.universal_category_id || 'all'}
                onValueChange={(value) => updateSetting('universal_category_id', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="সব ক্যাটাগরি" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                  {universalCategories
                    .filter((cat) => !formData.settings.product_type || cat.product_type === formData.settings.product_type)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_bn} ({cat.product_type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>প্রোডাক্ট সংখ্যা</Label>
                <Input
                  type="number"
                  value={formData.settings.limit || 10}
                  onChange={(e) => updateSetting('limit', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>কলাম সংখ্যা</Label>
                <Input
                  type="number"
                  value={formData.settings.columns || 5}
                  onChange={(e) => updateSetting('columns', Number(e.target.value))}
                />
              </div>
            </div>
            {renderSmartLinkField(sectionType)}
          </div>
        );

      case 'universal_category_grid': {
        const selectedUniIds: string[] = formData.settings.universal_category_ids || [];
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🏷️ ইউনিভার্সাল ক্যাটাগরি গ্রিড সেটিংস (ডাটাবেস)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>প্রোডাক্ট টাইপ (ডাটাবেস থেকে)</Label>
                <Select
                  value={formData.settings.product_type || ''}
                  onValueChange={(value) => updateSetting('product_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="প্রোডাক্ট টাইপ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((pt) => (
                      <SelectItem key={pt.id} value={pt.type_key}>
                        🛍️ {pt.name_bn} ({pt.name_en})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>সর্বোচ্চ ক্যাটাগরি সংখ্যা</Label>
                <Input
                  type="number"
                  value={formData.settings.max_categories || 8}
                  onChange={(e) => updateSetting('max_categories', Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label>ডাটাবেস থেকে নির্দিষ্ট ইউনিভার্সাল ক্যাটাগরি নির্বাচন করুন (ঐচ্ছিক)</Label>
              <div className="border rounded-lg max-h-44 overflow-y-auto p-2 space-y-1">
                {universalCategories
                  .filter((c) => !formData.settings.product_type || c.product_type === formData.settings.product_type)
                  .map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 p-1.5 hover:bg-muted rounded cursor-pointer text-sm">
                      <Checkbox
                        checked={selectedUniIds.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...selectedUniIds, cat.id]
                            : selectedUniIds.filter((id) => id !== cat.id);
                          updateSetting('universal_category_ids', next);
                        }}
                      />
                      <span>{cat.name_bn}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        {cat.product_type}
                      </Badge>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        );
      }

      case 'promo_banner':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🎯 প্রমোশনাল ব্যানার সেটিংস</h4>
            <div>
              <Label>ব্যানার ইমেজ</Label>
              <BannerImageUpload
                value={formData.settings.background_image || ''}
                onChange={(url) => updateSetting('background_image', url)}
                label="ব্যানার ইমেজ আপলোড করুন"
              />
            </div>

            <div>
              <Label>ব্যানার টাইপ</Label>
              <Select
                value={formData.settings.banner_mode || 'image_with_text'}
                onValueChange={(val) => updateSetting('banner_mode', val)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image_only">শুধু ইমেজ</SelectItem>
                  <SelectItem value="image_with_text">ইমেজ + টেক্সট ওভারলে</SelectItem>
                  <SelectItem value="gradient_with_text">গ্রেডিয়েন্ট + টেক্সট</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.settings.banner_mode !== 'image_only' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>ব্যানার টাইটেল</Label>
                    <Input
                      value={formData.settings.title || ''}
                      onChange={(e) => updateSetting('title', e.target.value)}
                      placeholder="বিশেষ অফার!"
                    />
                  </div>
                  <div>
                    <Label>ব্যাজ টেক্সট</Label>
                    <Input
                      value={formData.settings.badge_text || ''}
                      onChange={(e) => updateSetting('badge_text', e.target.value)}
                      placeholder="সীমিত সময়ের অফার"
                    />
                  </div>
                </div>
                <div>
                  <Label>বিবরণ</Label>
                  <Textarea
                    value={formData.settings.description || ''}
                    onChange={(e) => updateSetting('description', e.target.value)}
                    placeholder="সীমিত সময়ের জন্য বিশেষ ছাড়"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>বাটন টেক্সট</Label>
                    <Input
                      value={formData.settings.button_text || ''}
                      onChange={(e) => updateSetting('button_text', e.target.value)}
                      placeholder="এখনই কিনুন"
                    />
                  </div>
                  <div>
                    <Label>বাটন লিংক</Label>
                    <Input
                      value={formData.settings.button_link || ''}
                      onChange={(e) => updateSetting('button_link', e.target.value)}
                      placeholder="/shop"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>উচ্চতা (px)</Label>
                <Input
                  type="number"
                  min={100}
                  max={800}
                  value={formData.settings.height || 300}
                  onChange={(e) => updateSetting('height', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>বর্ডার রেডিয়াস (px)</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={formData.settings.border_radius ?? 16}
                  onChange={(e) => updateSetting('border_radius', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        );

      case 'billboard':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">🎯 স্পন্সর বিলবোর্ড (২টি কার্ড) সেটিংস</h4>

            <div className="p-3 rounded-lg border bg-rose-500/5 space-y-3">
              <h5 className="text-xs font-bold text-rose-600 uppercase">বিলবোর্ড কার্ড ১ (বাম পাশ)</h5>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">ব্যাজ</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad1_badge || ''}
                    onChange={(e) => updateSetting('ad1_badge', e.target.value)}
                    placeholder="পেমেন্ট ক্যাশব্যাক"
                  />
                </div>
                <div>
                  <Label className="text-xs">ট্যাগ</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad1_tag || ''}
                    onChange={(e) => updateSetting('ad1_tag', e.target.value)}
                    placeholder="সীমিত সময়ের জন্য"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">শিরোনাম</Label>
                <Input
                  className="h-8 text-xs"
                  value={formData.settings.ad1_title || ''}
                  onChange={(e) => updateSetting('ad1_title', e.target.value)}
                  placeholder="বিকাশ ও নগদে পেমেন্টে ১০% নিশ্চিত ক্যাশব্যাক!"
                />
              </div>
              <div>
                <Label className="text-xs">বিবরণ</Label>
                <Textarea
                  rows={2}
                  className="text-xs"
                  value={formData.settings.ad1_description || ''}
                  onChange={(e) => updateSetting('ad1_description', e.target.value)}
                  placeholder="যেকোনো বই অর্ডারে বিকাশ অথবা নগদে অগ্রিম মূল্য পরিশোধ করলেই..."
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">কুপন কোড</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad1_coupon || ''}
                    onChange={(e) => updateSetting('ad1_coupon', e.target.value)}
                    placeholder="BKASH10"
                  />
                </div>
                <div>
                  <Label className="text-xs">বাটন টেক্সট</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad1_button_text || ''}
                    onChange={(e) => updateSetting('ad1_button_text', e.target.value)}
                    placeholder="অফার বিস্তারিত"
                  />
                </div>
                <div>
                  <Label className="text-xs">বাটন লিংক</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad1_button_link || ''}
                    onChange={(e) => updateSetting('ad1_button_link', e.target.value)}
                    placeholder="/offers"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-emerald-500/5 space-y-3">
              <h5 className="text-xs font-bold text-emerald-600 uppercase">বিলবোর্ড কার্ড ২ (ডান পাশ)</h5>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">ব্যাজ</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad2_badge || ''}
                    onChange={(e) => updateSetting('ad2_badge', e.target.value)}
                    placeholder="মেগা বান্ডেল ছাড়"
                  />
                </div>
                <div>
                  <Label className="text-xs">ট্যাগ</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad2_tag || ''}
                    onChange={(e) => updateSetting('ad2_tag', e.target.value)}
                    placeholder="সকল শ্রেণির জন্য"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">শিরোনাম</Label>
                <Input
                  className="h-8 text-xs"
                  value={formData.settings.ad2_title || ''}
                  onChange={(e) => updateSetting('ad2_title', e.target.value)}
                  placeholder="স্কুল ও মাদ্রাসার সিলেবাস বইসেটে ১৫% প্যাকেজ ছাড়!"
                />
              </div>
              <div>
                <Label className="text-xs">বিবরণ</Label>
                <Textarea
                  rows={2}
                  className="text-xs"
                  value={formData.settings.ad2_description || ''}
                  onChange={(e) => updateSetting('ad2_description', e.target.value)}
                  placeholder="১ম থেকে দ্বাদশ শ্রেণির সম্পূর্ণ পাঠ্যবই ও গাইড সেট..."
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">ফুটার নোট</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad2_footer_text || ''}
                    onChange={(e) => updateSetting('ad2_footer_text', e.target.value)}
                    placeholder="🚚 ৪৯৯৳+ ফ্রি ডেলিভারি"
                  />
                </div>
                <div>
                  <Label className="text-xs">বাটন টেক্সট</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad2_button_text || ''}
                    onChange={(e) => updateSetting('ad2_button_text', e.target.value)}
                    placeholder="সিলেবাস সেট কিনুন"
                  />
                </div>
                <div>
                  <Label className="text-xs">বাটন লিংক</Label>
                  <Input
                    className="h-8 text-xs"
                    value={formData.settings.ad2_button_link || ''}
                    onChange={(e) => updateSetting('ad2_button_link', e.target.value)}
                    placeholder="/syllabus"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'community_stats': {
        const defaultStats = [
          { number: '৫০,০০০+', label: 'বইয়ের বিশাল সংগ্রহ', sublabel: 'হাজারো লেখক ও প্রকাশনীর বই' },
          { number: '১,৫০,০০০+', label: 'সন্তুষ্ট পাঠক ও পরিবার', sublabel: 'সারাদেশ জুড়ে বিশ্বস্ত পাঠকমহল' },
          { number: '৬৪ জেলা', label: 'সরাসরি ক্যাশ অন ডেলিভারি', sublabel: 'দ্রুততম সময়ে হোম ডেলিভারি' },
          { number: '৪.৯ / ৫.০', label: 'গড় গ্রাহক সন্তুষ্টি রেটিং', sublabel: '২৫,০০০+ ভেরিফায়েড রিভিউ' },
        ];
        const stats = defaultStats.map((d, idx) => ({
          ...d,
          ...(formData.settings.stats?.[idx] || {}),
        }));

        const updateStat = (idx: number, field: string, val: string) => {
          const next = stats.map((s, i) => (i === idx ? { ...s, [field]: val } : s));
          updateSetting('stats', next);
        };

        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">👥 পাঠক পরিবার ও পরিসংখ্যান সেটিংস</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.map((st, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <Label className="text-xs font-bold">কাউন্টার কার্ড #{idx + 1}</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="সংখ্যা (যেমন: ৫০,০০০+)"
                    value={st.number}
                    onChange={(e) => updateStat(idx, 'number', e.target.value)}
                  />
                  <Input
                    className="h-8 text-xs"
                    placeholder="শিরোনাম"
                    value={st.label}
                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                  />
                  <Input
                    className="h-8 text-xs"
                    placeholder="সাব-টেক্সট"
                    value={st.sublabel}
                    onChange={(e) => updateStat(idx, 'sublabel', e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={formData.settings.show_testimonials !== false}
                onCheckedChange={(checked) => updateSetting('show_testimonials', checked)}
              />
              <Label>পাঠকদের রিভিউ / মতামত কার্ড দেখান</Label>
            </div>
          </div>
        );
      }

      case 'newsletter':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">📧 নিউজলেটার সেটিংস</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ইনপুট প্লেসহোল্ডার</Label>
                <Input
                  value={formData.settings.placeholder || ''}
                  onChange={(e) => updateSetting('placeholder', e.target.value)}
                  placeholder="আপনার ইমেইল লিখুন"
                />
              </div>
              <div>
                <Label>সাবস্ক্রাইব বাটন টেক্সট</Label>
                <Input
                  value={formData.settings.button_text || ''}
                  onChange={(e) => updateSetting('button_text', e.target.value)}
                  placeholder="সাবস্ক্রাইব"
                />
              </div>
            </div>
          </div>
        );

      case 'top_authors':
      case 'best_selling_brands':
      case 'best_selling_publishers':
      case 'recently_viewed':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">সেকশন সেটিংস</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>সর্বোচ্চ আইটেম সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={30}
                  value={formData.settings.limit || 12}
                  onChange={(e) => updateSetting('limit', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>কলাম সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={8}
                  value={formData.settings.columns || 6}
                  onChange={(e) => updateSetting('columns', Number(e.target.value))}
                />
              </div>
            </div>
            {renderSmartLinkField(sectionType)}
          </div>
        );

      default:
        // Covers: new_releases, bestsellers, recommended, featured_products, preorder_products,
        // top_selling_products, top_selling_universal_products, universal_flash_sale,
        // recently_sold, offer_products, ebooks, weekly_best_books, weekly_best_universal,
        // bundle_showcase, ai_recommendations
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">সেকশন ও ক্যাটাগরি ফিল্টার সেটিংস</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>প্রোডাক্ট সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={40}
                  value={formData.settings.limit || 10}
                  onChange={(e) => updateSetting('limit', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>কলাম সংখ্যা</Label>
                <Input
                  type="number"
                  min={2}
                  max={6}
                  value={formData.settings.columns || 5}
                  onChange={(e) => updateSetting('columns', Number(e.target.value))}
                />
              </div>
            </div>

            {(sectionType === 'offer_products' || sectionType === 'universal_flash_sale') && (
              <div>
                <Label>মিনিমাম ডিসকাউন্ট (%)</Label>
                <Input
                  type="number"
                  value={formData.settings.min_discount || 10}
                  onChange={(e) => updateSetting('min_discount', Number(e.target.value))}
                />
              </div>
            )}

            {(sectionType === 'universal_flash_sale' ||
              sectionType === 'top_selling_universal_products' ||
              sectionType === 'weekly_best_universal') && (
              <div>
                <Label>প্রোডাক্ট টাইপ (ডাটাবেস থেকে)</Label>
                <Select
                  value={formData.settings.product_type || 'all'}
                  onValueChange={(value) => updateSetting('product_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="প্রোডাক্ট টাইপ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🛒 সব প্রোডাক্ট টাইপ</SelectItem>
                    {productTypes.map((pt) => (
                      <SelectItem key={pt.id} value={pt.type_key}>
                        🛍️ {pt.name_bn} ({pt.name_en})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {renderSmartLinkField(sectionType)}

            <div>
              <Label>ডাটাবেস ক্যাটাগরি দিয়ে ফিল্টার করুন (ঐচ্ছিক)</Label>
              <DynamicCategorySelector
                selectedIds={formData.settings.category_ids || []}
                onChange={(ids) => updateSetting('category_ids', ids)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.settings.show_ranking || false}
                onCheckedChange={(checked) => updateSetting('show_ranking', checked)}
              />
              <Label>র‍্যাংকিং ব্যাজ দেখান</Label>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">হোমপেজ সেকশন ম্যানেজমেন্ট</h1>
            <p className="text-muted-foreground text-sm">
              হোমপেজের প্রতিটি সেকশনের সকল ফিচার, ডাটাবেস ক্যাটাগরি, সাব-ক্যাটাগরি ও প্রোডাক্ট সম্পূর্ণ কাস্টমাইজ করুন
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSyncDefaultSections} title="মূল সব সেকশন সিঙ্ক ও রিস্টোর করুন">
              <RotateCcw className="w-4 h-4 mr-2" />
              ডিফল্ট সেকশন সিঙ্ক
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              নতুন সেকশন
            </Button>
          </div>
        </div>

        {/* Database Category Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">মোট হোমপেজ সেকশন</p>
              <p className="text-xl font-bold">{sections.length}টি</p>
            </div>
            <Badge variant="secondary">{sections.filter((s) => s.is_active).length}টি সক্রিয়</Badge>
          </div>
          <div className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">ডাটাবেস মূল ক্যাটাগরি</p>
              <p className="text-xl font-bold">{parentCategories.length}টি</p>
            </div>
            <Link to="/admin/categories" className="text-xs text-primary hover:underline">
              ম্যানেজ →
            </Link>
          </div>
          <div className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">ডাটাবেস সাব-ক্যাটাগরি</p>
              <p className="text-xl font-bold">{subCategories.length}টি</p>
            </div>
            <Link to="/admin/categories" className="text-xs text-primary hover:underline">
              ম্যানেজ →
            </Link>
          </div>
          <div className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">ইউনিভার্সাল ক্যাটাগরি</p>
              <p className="text-xl font-bold">{universalCategories.length}টি</p>
            </div>
            <Link to="/admin/universal-categories" className="text-xs text-primary hover:underline">
              ম্যানেজ →
            </Link>
          </div>
        </div>

        {/* Sections List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">লোড হচ্ছে...</div>
            ) : sections.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                কোন সেকশন নেই। নতুন সেকশন যোগ করুন।
              </div>
            ) : (
              <div className="divide-y">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${
                      !section.is_active ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30 text-xs"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30 text-xs"
                        >
                          ▼
                        </button>
                      </div>
                      <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium flex flex-wrap items-center gap-2">
                          <span>{sectionTypeLabels[section.section_type] || section.section_type}</span>
                          {Array.isArray(section.settings?.category_ids) && section.settings.category_ids.length > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {section.settings.category_ids.length}টি ক্যাটাগরি ফিল্টারড
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {section.title_bn}
                          {section.subtitle_bn ? ` — ${section.subtitle_bn}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(section)}
                        title={section.is_active ? 'ইনঅ্যাক্টিভ করুন' : 'অ্যাক্টিভ করুন'}
                      >
                        {section.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                        className="gap-1.5 text-xs"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        এডিট করুন
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(section.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreating
                  ? 'নতুন হোমপেজ সেকশন যোগ করুন'
                  : `সেকশন কাস্টমাইজ করুন: ${sectionTypeLabels[formData.section_type] || formData.section_type}`}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>সেকশন টাইপ</Label>
                <Select
                  value={formData.section_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      section_type: value,
                      title_bn: prev.title_bn || (sectionTypeLabels[value]?.replace(/^[^\s]+\s/, '') ?? ''),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="সেকশন টাইপ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-6 py-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>সেকশন দৃশ্যমান (Active)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.settings?.hide_title || false}
                    onCheckedChange={(checked) => updateSetting('hide_title', checked)}
                  />
                  <Label>টাইটেল লুকান</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.settings?.use_carousel !== false}
                    onCheckedChange={(checked) => updateSetting('use_carousel', checked)}
                  />
                  <Label>কারোসেল স্লাইডার</Label>
                </div>
              </div>

              {!formData.settings?.hide_title && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>টাইটেল (বাংলা) *</Label>
                    <Input
                      value={formData.title_bn}
                      onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                      required={!formData.settings?.hide_title}
                    />
                  </div>
                  <div>
                    <Label>Title (English)</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>সাবটাইটেল / সংক্ষিপ্ত বিবরণ (বাংলা)</Label>
                    <Input
                      value={formData.subtitle_bn}
                      onChange={(e) => setFormData({ ...formData, subtitle_bn: e.target.value })}
                      placeholder="সেকশনের নিচে প্রদর্শিত সাবটাইটেল..."
                    />
                  </div>
                </div>
              )}

              {renderSettingsEditor()}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit">
                  {isCreating ? 'সেকশন যোগ করুন' : 'পরিবর্তন সেভ করুন'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminHomepage;
