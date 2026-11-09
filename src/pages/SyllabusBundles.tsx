import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ShoppingCart,
  Zap,
  Sparkles,
  School,
  Check,
  Truck,
  ArrowRight,
  ShieldCheck,
  Percent,
  Search,
  Download,
  Share2,
  MessageCircle,
  HelpCircle,
  Flame,
  Award,
  BookCheck,
  ChevronRight,
} from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { QuickCheckoutModal } from "@/components/QuickCheckoutModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SyllabusBook {
  id: string;
  title: string;
  subject: string;
  price: number;
  originalPrice: number;
  image: string;
  author?: string;
}

interface SyllabusBundle {
  id: string;
  institutionType: "bangla" | "madrasa" | "qawmi" | "college" | "english";
  grade: string;
  gradeLabel: string;
  bundleTitle: string;
  description: string;
  discountPercent: number;
  featuredBadge?: string;
  books: SyllabusBook[];
}

const PROMO_BANNERS = [
  {
    id: 1,
    title: "২০২৬ শিক্ষাক্রমের সম্পূর্ণ সিলেবাস বইসেট",
    subtitle: "স্কুল, কলেজ ও মাদ্রাসার সব বিষয়ের অনুমোদিত পূর্ণাঙ্গ নতুন পাঠ্যবই ও গাইড সেট — এক ক্লিকে সম্পূর্ণ সেট সংগ্রহ করুন!",
    badge: "মেগা সিলেবাস ক্যাম্পেইন",
    gradient: "from-emerald-800 via-teal-900 to-slate-900",
    discountTag: "১৫% পর্যন্ত বিশেষ ছাড়",
    accentBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  },
  {
    id: 2,
    title: "কওমি মাদ্রাসা ও দরসে নিজামি পূর্ণাঙ্গ কিতাব সম্ভার",
    subtitle: "আদব, উলূমুল হাদিস, আরবি ব্যাকরণ ও অভিধানের বিশুদ্ধ তাহকিককৃত কিতাব সেট বিশেষ কমিশনে ঘরে বসেই অর্ডার করুন।",
    badge: "মাদ্রাসা স্পেশাল",
    gradient: "from-amber-900 via-stone-900 to-neutral-900",
    discountTag: "সর্বোচ্চ ২০% কমিশন",
    accentBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  },
  {
    id: 3,
    title: "একাদশ-দ্বাদশ (HSC) বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা",
    subtitle: "শীর্ষ প্রকাশনী ও স্বনামধন্য শিক্ষকদের বোর্ড অনুমোদিত পাঠ্যবই এবং টেস্ট পেপারের সম্পূর্ণ নির্ভরযোগ্য প্যাকেজ।",
    badge: "HSC ২০২৬ স্পেশাল",
    gradient: "from-blue-900 via-indigo-950 to-slate-900",
    discountTag: "বইপ্রতি উপহার ফ্রি!",
    accentBg: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  },
];

const BUNDLE_DATA: SyllabusBundle[] = [
  {
    id: "bangla-class-5",
    institutionType: "bangla",
    grade: "5",
    gradeLabel: "৫ম শ্রেণি",
    bundleTitle: "৫ম শ্রেণি সম্পূর্ণ পাঠ্যবই ও মডেল টেস্ট সেট (২০২৬)",
    description: "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত ৫ম শ্রেণির সব বিষয়ের সম্পূর্ণ নতুন বইয়ের সেট।",
    discountPercent: 12,
    featuredBadge: "জনপ্রিয় সেট",
    books: [
      { id: "b5-1", title: "আমার বাংলা বই — ৫ম শ্রেণি", subject: "বাংলা", price: 110, originalPrice: 125, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b5-2", title: "English for Today — Class 5", subject: "ইংরেজি", price: 120, originalPrice: 135, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b5-3", title: "প্রাথমিক গণিত — ৫ম শ্রেণি", subject: "গণিত", price: 130, originalPrice: 145, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b5-4", title: "প্রাথমিক বিজ্ঞান — ৫ম শ্রেণি", subject: "বিজ্ঞান", price: 125, originalPrice: 140, image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b5-5", title: "বাংলাদেশ ও বিশ্বপরিচয় — ৫ম শ্রেণি", subject: "সমাজ", price: 115, originalPrice: 130, image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b5-6", title: "ইসলাম ও নৈতিক শিক্ষা — ৫ম শ্রেণি", subject: "ধর্ম", price: 100, originalPrice: 115, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
    ],
  },
  {
    id: "bangla-class-6",
    institutionType: "bangla",
    grade: "6",
    gradeLabel: "৬ষ্ঠ শ্রেণি",
    bundleTitle: "৬ষ্ঠ শ্রেণি নতুন শিক্ষাক্রম পাঠ্যবই সম্পূর্ণ সেট (২০২৬)",
    description: "নতুন শিক্ষাক্রমের আলোকে প্রণীত সকল বিষয়ভিত্তিক পাঠ্যবই ও অনুশীলনী বই।",
    discountPercent: 10,
    featuredBadge: "নতুন কারিকুলাম",
    books: [
      { id: "b6-1", title: "বাংলা — ৬ষ্ঠ শ্রেণি (নতুন কারিকুলাম)", subject: "বাংলা", price: 140, originalPrice: 160, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b6-2", title: "English — Class 6", subject: "ইংরেজি", price: 150, originalPrice: 170, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b6-3", title: "গণিত — ৬ষ্ঠ শ্রেণি", subject: "গণিত", price: 160, originalPrice: 180, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b6-4", title: "বিজ্ঞান (অনুসন্ধানী ও অনুশীলন পাঠ)", subject: "বিজ্ঞান", price: 170, originalPrice: 195, image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b6-5", title: "ডিজিটাল প্রযুক্তি — ৬ষ্ঠ শ্রেণি", subject: "আইসিটি", price: 120, originalPrice: 135, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b6-6", title: "ইতিহাস ও সামাজিক বিজ্ঞান", subject: "সমাজ", price: 130, originalPrice: 145, image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
    ],
  },
  {
    id: "bangla-class-9",
    institutionType: "bangla",
    grade: "9",
    gradeLabel: "৯ম-১০ম (বিজ্ঞান)",
    bundleTitle: "৯ম-১০ম শ্রেণি বিজ্ঞান বিভাগ সম্পূর্ণ পাঠ্যবই ও সহায়ক সেট",
    description: "পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিত সহ SSC বিজ্ঞান বিভাগের আবশ্যকীয় পূর্ণ সেট।",
    discountPercent: 15,
    featuredBadge: "বেস্টসেলার বান্ডেল",
    books: [
      { id: "b9-1", title: "পদার্থবিজ্ঞান — ৯ম-১০ম শ্রেণি", subject: "পদার্থবিজ্ঞান", price: 190, originalPrice: 220, image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b9-2", title: "রসায়ন — ৯ম-১০ম শ্রেণি", subject: "রসায়ন", price: 195, originalPrice: 225, image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b9-3", title: "জীববিজ্ঞান — ৯ম-১০ম শ্রেণি", subject: "জীববিজ্ঞান", price: 185, originalPrice: 215, image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b9-4", title: "উচ্চতর গণিত — ৯ম-১০ম শ্রেণি", subject: "উচ্চতর গণিত", price: 210, originalPrice: 240, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b9-5", title: "বাংলা সাহিত্য ও সহপাঠ — ৯ম-১০ম", subject: "বাংলা", price: 160, originalPrice: 180, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
      { id: "b9-6", title: "English Grammar and Composition", subject: "ইংরেজি", price: 175, originalPrice: 200, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80", author: "NCTB" },
    ],
  },
  {
    id: "madrasa-dakhil-9",
    institutionType: "madrasa",
    grade: "dakhil",
    gradeLabel: "দাখিল ৯ম-১০ম",
    bundleTitle: "দাখিল ৯ম-১০ম শ্রেণি সাধারণ ও আরবি বিষয় পূর্ণাঙ্গ সেট",
    description: "কুরআন মাজীদ, হাদিস শরীফ, আরবি ১ম-২য় পত্র এবং সাধারণ বিষয়াবলীর অনুমোদিত সেট।",
    discountPercent: 14,
    featuredBadge: "মাদ্রাসা বোর্ড",
    books: [
      { id: "m9-1", title: "কুরআন মাজীদ ও তাজবীদ — দাখিল ৯ম-১০ম", subject: "কুরআন", price: 160, originalPrice: 180, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80", author: "বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড" },
      { id: "m9-2", title: "হাদিস শরীফ — দাখিল ৯ম-১০ম", subject: "হাদিস", price: 170, originalPrice: 190, image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80", author: "বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড" },
      { id: "m9-3", title: "আল লুগাতুল আরাবিয়্যাতুল ইত্তেসালিয়্যাহ (আরবি ১ম)", subject: "আরবি ১ম", price: 155, originalPrice: 175, image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80", author: "মাদ্রাসা বোর্ড" },
      { id: "m9-4", title: "কাওয়াইদুল লুগাতিল আরাবিয়্যাহ (আরবি ব্যাকরণ)", subject: "আরবি ২য়", price: 150, originalPrice: 170, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80", author: "মাদ্রাসা বোর্ড" },
      { id: "m9-5", title: "সাধারণ গণিত — দাখিল ৯ম-১০ম", subject: "গণিত", price: 160, originalPrice: 180, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80", author: "NCTB ও মাদ্রাসা বোর্ড" },
    ],
  },
  {
    id: "qawmi-adab-set",
    institutionType: "qawmi",
    grade: "qawmi-adab",
    gradeLabel: "কওমি মাদ্রাসা (আদব বিভাগ)",
    bundleTitle: "কওমি মাদ্রাসা উচ্চতর আদব ও আরবি সাহিত্য পূর্ণাঙ্গ কিতাব সেট",
    description: "মাকামাতে হারিরি, দেওয়ানে মুতানাব্বি, মুয়াল্লাকাত ও আরবি ব্যাকরণের প্রামাণ্য কিতাব সেট।",
    discountPercent: 18,
    featuredBadge: "কওমি বিশেষ",
    books: [
      { id: "qa-1", title: "মাকামাতে হারিরি (তাহকিক সংস্করণ)", subject: "আদব", price: 320, originalPrice: 380, image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80", author: "আল্লামা কাসিম আল-হারিরি" },
      { id: "qa-2", title: "আল-মু'জামুল ওয়াসিত (আরবি-আরবি বৃহৎ অভিধান)", subject: "অভিধান", price: 650, originalPrice: 780, image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80", author: "মাজমাউল লুগাহ কায়রো" },
      { id: "qa-3", title: "মুয়াল্লিমুল ইনশা (১ম, ২য় ও ৩য় খণ্ড)", subject: "ইনশা", price: 380, originalPrice: 450, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80", author: "মাওলানা শহিদুল ইসলাম" },
      { id: "qa-4", title: "শারহু নুখবাতিল ফিকার (উলূমুল হাদিস)", subject: "উসূলে হাদিস", price: 210, originalPrice: 250, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80", author: "ইবনে হাজার আসক্বালানী" },
    ],
  },
  {
    id: "college-hsc-science",
    institutionType: "college",
    grade: "hsc",
    gradeLabel: "একাদশ-দ্বাদশ (HSC)",
    bundleTitle: "HSC বিজ্ঞান বিভাগ সম্পূর্ণ পাঠ্যবই ও টেস্টপেপার সেট (১ম ও ২য় বর্ষ)",
    description: "উচ্চ মাধ্যমিক বিজ্ঞান বিভাগের জন্য শীর্ষ লেখকদের অনুমোদিত পাঠ্যবই প্যাকেজ।",
    discountPercent: 15,
    featuredBadge: "HSC টপ চয়েস",
    books: [
      { id: "c-1", title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র (প্রফেসর মো. আমির হোসেন)", subject: "পদার্থবিজ্ঞান", price: 420, originalPrice: 480, image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80", author: "অক্ষরপত্র প্রকাশনী" },
      { id: "c-2", title: "রসায়ন ১ম ও ২য় পত্র (প্রফেসর মো. আবুল কালাম আজাদ)", subject: "রসায়ন", price: 440, originalPrice: 500, image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80", author: "লেবানী প্রকাশনী" },
      { id: "c-3", title: "জীববিজ্ঞান ১ম ও ২য় পত্র (প্রফেসর ড. মোহাম্মদ আবুল হাসান)", subject: "জীববিজ্ঞান", price: 430, originalPrice: 490, image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&auto=format&fit=crop&q=80", author: "হাসান বুক হাউস" },
      { id: "c-4", title: "উচ্চতর গণিত ১ম ও ২য় পত্র (প্রফেসর অসীম কুমার সাহা)", subject: "উচ্চতর গণিত", price: 450, originalPrice: 520, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80", author: "অক্ষরপত্র প্রকাশনী" },
      { id: "c-5", title: "তথ্য ও যোগাযোগ প্রযুক্তি — একাদশ-দ্বাদশ", subject: "আইসিটি", price: 280, originalPrice: 320, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80", author: "সিস্টেক পাবলিকেশন্স" },
    ],
  },
];

export default function SyllabusBundles() {
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [selectedType, setSelectedType] = useState<"bangla" | "madrasa" | "qawmi" | "college">("bangla");
  const [selectedBundleId, setSelectedBundleId] = useState<string>("bangla-class-5");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([
    "b5-1", "b5-2", "b5-3", "b5-4", "b5-5", "b5-6"
  ]);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const { addToCart } = useCartContext();
  const navigate = useNavigate();

  const currentBanner = PROMO_BANNERS[activeBannerIdx];

  // Find active bundle
  const currentBundle = useMemo(() => {
    return BUNDLE_DATA.find((b) => b.id === selectedBundleId) || BUNDLE_DATA[0];
  }, [selectedBundleId]);

  // Handle bundle selection
  const handleSelectBundle = (bundle: SyllabusBundle) => {
    setSelectedBundleId(bundle.id);
    setSelectedBookIds(bundle.books.map((b) => b.id));
  };

  // Toggle book inside bundle
  const toggleBookSelection = (id: string) => {
    if (selectedBookIds.includes(id)) {
      if (selectedBookIds.length <= 1) {
        toast.info("কমপক্ষে একটি বই নির্বাচিত রাখতে হবে");
        return;
      }
      setSelectedBookIds((p) => p.filter((x) => x !== id));
    } else {
      setSelectedBookIds((p) => [...p, id]);
    }
  };

  const handleSelectAllBooks = () => {
    setSelectedBookIds(currentBundle.books.map((b) => b.id));
    toast.success("সবগুলো বই নির্বাচিত করা হয়েছে");
  };

  // Filter books by search query if any
  const displayedBooks = useMemo(() => {
    if (!searchQuery.trim()) return currentBundle.books;
    const q = searchQuery.toLowerCase();
    return currentBundle.books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [currentBundle, searchQuery]);

  // Calculations
  const filteredBooks = currentBundle.books.filter((b) => selectedBookIds.includes(b.id));
  const subtotal = filteredBooks.reduce((sum, b) => sum + b.price, 0);
  const originalSubtotal = filteredBooks.reduce((sum, b) => sum + b.originalPrice, 0);
  const savings = Math.max(0, originalSubtotal - subtotal);
  const isFreeDelivery = subtotal >= 499;

  const handleAddAllToCart = () => {
    filteredBooks.forEach((book) => {
      addToCart({
        id: book.id,
        title: book.title,
        price: book.price,
        originalPrice: book.originalPrice,
        image: book.image,
        author: book.author || "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড",
        category: "সিলেবাস বই",
      });
    });
    toast.success(`সিলেবাসের ${filteredBooks.length}টি বই কার্টে যোগ করা হয়েছে!`);
  };

  const handleWhatsAppOrder = () => {
    const bookTitles = filteredBooks.map((b, i) => `${i + 1}. ${b.title} (৳${b.price})`).join("\n");
    const msg = `আসসালামু আলাইকুম, আমি বইআলো থেকে সিলেবাস বইসেট অর্ডার করতে চাই:\n\nপ্যাকেজ: ${currentBundle.bundleTitle}\nমোট বই: ${filteredBooks.length}টি\nমূল্য: ৳${subtotal}\n\nবইয়ের তালিকা:\n${bookTitles}`;
    window.open(`https://wa.me/8801714005986?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="সিলেবাস বুকসেট বান্ডেল ২০২৬ — স্কুল, কলেজ ও মাদ্রাসার পূর্ণাঙ্গ বই | বইআলো"
        description="১ম থেকে দ্বাদশ শ্রেণির নতুন শিক্ষাক্রমের সকল পাঠ্যবই এবং কওমি ও আলিয়া মাদ্রাসার কিতাব সেট আকর্ষণীয় ছাড়ে ঘরে বসে অর্ডার করুন।"
      />
      <AnnouncementBar />
      <Header />

      <main className="container max-w-6xl py-6 md:py-10 space-y-8">
        {/* Dynamic Multi-Banner Hero Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/30">
          <div className={cn("relative p-6 sm:p-10 md:p-12 text-white bg-gradient-to-r", currentBanner.gradient)}>
            {/* Background Texture elements */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute right-12 top-6 opacity-10 hidden lg:block pointer-events-none">
              <GraduationCap className="w-72 h-72 text-white" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("border text-xs px-3 py-1 font-semibold", currentBanner.accentBg)}>
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {currentBanner.badge}
                </Badge>
                <span className="bg-rose-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                  {currentBanner.discountTag}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {currentBanner.title}
              </h1>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                {currentBanner.subtitle}
              </p>

              {/* Trust Features Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-white/90">
                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                  <Truck className="w-3.5 h-3.5 text-amber-300" />
                  ৪৯৯৳+ অর্ডারে ফ্রি ডেলিভারি
                </span>
                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  ১০০% নতুন ও নির্ভুল সংস্করণ
                </span>
                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                  ক্যাশ অন ডেলিভারি সুবিধা
                </span>
              </div>

              {/* Action Buttons in Banner */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => {
                    const el = document.getElementById("bundle-workspace");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl gap-2 shadow-lg"
                >
                  <BookCheck className="w-4 h-4" />
                  সিলেবাস বই নির্বাচন করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDownloadModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm rounded-xl gap-2"
                >
                  <Download className="w-4 h-4" />
                  সিলেবাস গাইড (PDF)
                </Button>
              </div>
            </div>

            {/* Banner Dots / Switcher */}
            <div className="absolute bottom-4 right-6 flex items-center gap-2 z-10">
              {PROMO_BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBannerIdx(i)}
                  aria-label={`ব্যানার ${i + 1}`}
                  className={cn(
                    "h-2.5 rounded-full transition-all cursor-pointer",
                    activeBannerIdx === i ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Institution Type Tabs */}
        <div className="space-y-3" id="bundle-workspace">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              প্রতিষ্ঠান ও শিক্ষাক্রম নির্বাচন করুন
            </h2>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              আপনার প্রয়োজন অনুযায়ী বিভাগ সিলেক্ট করুন
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: "bangla" as const, label: "বাংলা মাধ্যম (NCTB)", icon: School, count: "১ম - ১০ম" },
              { id: "madrasa" as const, label: "মাদ্রাসা শিক্ষা বোর্ড", icon: BookOpen, count: "দাখিল / আলিম" },
              { id: "qawmi" as const, label: "কওমি মাদ্রাসা (দরসে নিজামি)", icon: Award, count: "আদব / হাদিস" },
              { id: "college" as const, label: "কলেজ / HSC (একাদশ-দ্বাদশ)", icon: GraduationCap, count: "বিজ্ঞান / মানবিক" },
            ].map((type) => {
              const Icon = type.icon;
              const active = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    const firstMatch = BUNDLE_DATA.find((b) => b.institutionType === type.id);
                    if (firstMatch) handleSelectBundle(firstMatch);
                  }}
                  className={cn(
                    "px-4 py-3 rounded-2xl font-medium text-sm flex items-center gap-2.5 transition-all shrink-0 border cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.01]"
                      : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold leading-tight">{type.label}</p>
                    <span className={cn("text-[10px]", active ? "text-white/80" : "text-muted-foreground")}>
                      {type.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Class Selection Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {BUNDLE_DATA.filter((b) => b.institutionType === selectedType).map((bundle) => {
              const isSelected = bundle.id === selectedBundleId;
              return (
                <button
                  key={bundle.id}
                  onClick={() => handleSelectBundle(bundle)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border shrink-0 flex items-center gap-2 cursor-pointer",
                    isSelected
                      ? "bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm ring-1 ring-amber-500/30"
                      : "bg-card border-border text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <span>{bundle.gradeLabel}</span>
                  {bundle.featuredBadge && (
                    <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      {bundle.featuredBadge}
                    </span>
                  )}
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ({bundle.discountPercent}% ছাড়)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Search inside Active Bundle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="এই সেটের বইয়ের নাম বা বিষয় দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-10 rounded-xl bg-card border-border text-sm"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllBooks}
              className="text-xs text-primary hover:underline h-8"
            >
              সবগুলো বই সিলেক্ট করুন
            </Button>
          </div>
        </div>

        {/* Main Bundle Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Books List (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-foreground leading-tight">
                    {currentBundle.bundleTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentBundle.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  {filteredBooks.length}টি বই নির্বাচিত
                </Badge>
              </div>

              {/* Dynamic Savings Highlight */}
              {savings > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    বান্ডেল প্যাকেজে আপনার মোট সঞ্চয় হচ্ছে ৳{savings}!
                  </span>
                  <span className="font-bold">{currentBundle.discountPercent}% সাশ্রয়ী</span>
                </div>
              )}
            </div>

            {/* Book Cards Checklist */}
            <div className="space-y-2.5">
              {displayedBooks.map((book) => {
                const isChecked = selectedBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    onClick={() => toggleBookSelection(book.id)}
                    className={cn(
                      "p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none",
                      isChecked
                        ? "bg-card border-primary/40 shadow-xs ring-1 ring-primary/20"
                        : "bg-muted/30 border-border opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40 bg-background"
                        )}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded-md border border-border shrink-0 bg-muted shadow-xs"
                      />

                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          {book.subject}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{book.title}</h4>
                        <p className="text-xs text-muted-foreground">{book.author || "অনুমোদিত পাঠ্যবই"}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-primary">৳{book.price}</span>
                      {book.originalPrice > book.price && (
                        <p className="text-[11px] text-muted-foreground line-through">৳{book.originalPrice}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {displayedBooks.length === 0 && (
                <div className="p-8 text-center bg-card rounded-2xl border text-muted-foreground text-sm">
                  "{searchQuery}" দিয়ে কোনো বই পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>

          {/* Sticky Summary & Checkout Card (1 col) */}
          <div className="lg:col-span-1 sticky top-24 space-y-4">
            <Card className="rounded-2xl border-border/80 shadow-md overflow-hidden bg-card">
              <div className="p-5 bg-gradient-to-br from-primary/10 via-amber-500/5 to-card border-b border-border/80 space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  প্যাকেজ সামারি ও অর্ডার
                </span>
                <h3 className="font-bold text-base text-foreground line-clamp-1">
                  {currentBundle.bundleTitle}
                </h3>
              </div>

              <CardContent className="p-5 space-y-4 text-sm">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>নির্বাচিত বইয়ের সংখ্যা</span>
                    <span className="font-semibold text-foreground">{filteredBooks.length}টি</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>প্রকৃত গায়ের মূল্য</span>
                    <span className="line-through">৳{originalSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>বান্ডেল প্যাকেজ ছাড় ({currentBundle.discountPercent}%)</span>
                    <span>-৳{savings}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>ডেলিভারি চার্জ</span>
                    <span>{isFreeDelivery ? "ফ্রি (০৳)" : "৳৬০"}</span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-baseline font-bold text-lg">
                    <span>সর্বমোট প্রদেয়</span>
                    <span className="text-primary text-2xl font-extrabold">৳{subtotal}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2.5">
                  <Button
                    onClick={() => setQuickModalOpen(true)}
                    className="w-full h-11 text-sm font-bold rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    ১-ক্লিকে ইনস্ট্যান্ট অর্ডার করুন
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleAddAllToCart}
                    className="w-full h-10 text-xs font-semibold rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    সবগুলো কার্টে যোগ করুন
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleWhatsAppOrder}
                    className="w-full h-9 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন
                  </Button>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground space-y-1 border border-border/60">
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ক্যাশ অন ডেলিভারি সুবিধা
                  </p>
                  <p>বই হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করার সুবিধা।</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact & Assistance Card */}
            <div className="rounded-2xl border border-border/80 p-4 bg-card text-xs space-y-2">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" />
                সিলেবাস বই নিয়ে কোনো প্রশ্ন?
              </p>
              <p className="text-muted-foreground leading-relaxed">
                আপনার স্কুলের নির্দিষ্ট বইয়ের তালিকা অনুযায়ী কাস্টম বান্ডেল তৈরি করতে আমাদের হেল্পলাইনে যোগাযোগ করুন।
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="font-bold text-foreground">📞 01714-005986</span>
                <Link to="/contact" className="text-primary hover:underline font-medium">
                  যোগাযোগ ফর্ম &gt;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <section className="bg-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xs space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-bold text-foreground">সিলেবাস বুকসেট সম্পর্কিত সাধারণ জিজ্ঞাসা</h3>
            <p className="text-xs text-muted-foreground">বই অর্ডার করার আগে আপনার প্রয়োজনীয় তথ্যগুলো জেনে নিন</p>
          </div>

          <div className="max-w-3xl mx-auto pt-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-sm font-semibold">
                  নতুন শিক্ষাক্রমের সর্বশেষ সংস্করণের বই পাওয়া যাবে কি?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  হ্যাঁ, আমাদের সব বই জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) এবং সংশ্লিষ্ট শিক্ষা বোর্ড কর্তৃক অনুমোদিত ২০২৬ সালের সর্বশেষ সংস্করণের নতুন বই।
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-sm font-semibold">
                  বান্ডেল থেকে নির্দিষ্ট কোনো বই বাদ দিয়ে অর্ডার করা যাবে?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  অবশ্যই! আপনি বইয়ের নামের পাশে থাকা চেকবক্সে ক্লিক করে যে কোনো বই বাদ দিতে পারেন। আপনার নির্বাচিত বইগুলোর উপরই বান্ডেল ডিসকাউন্ট প্রযোজ্য হবে।
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-sm font-semibold">
                  ডেলিভারি পেতে কতদিন সময় লাগবে?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  ঢাকা সিটির মধ্যে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ কার্যদিবসের মধ্যে আপনার ঠিকানায় হোম ডেলিভারি পৌঁছে দেওয়া হবে।
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      {/* Syllabus Guide Preview / Download Modal */}
      <Dialog open={downloadModalOpen} onOpenChange={setDownloadModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Download className="w-5 h-5 text-primary" />
              সিলেবাস বুক লিস্ট নির্দেশিকা
            </DialogTitle>
            <DialogDescription className="text-xs">
              ২০২৬ শিক্ষাক্রমের বোর্ড নির্ধারিত পাঠ্যবই ও সহায়ক বইয়ের পূর্ণ তালিকা
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2">
              <p className="font-semibold text-foreground">
                বর্তমানে প্রদর্শিত হচ্ছে: {currentBundle.bundleTitle}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {currentBundle.books.map((b) => (
                  <li key={b.id}>
                    {b.title} — ৳{b.price}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => {
                toast.success("সিলেবাস নির্দেশিকা ডাউনলোড সম্পন্ন হয়েছে!");
                setDownloadModalOpen(false);
              }}
              className="w-full rounded-xl bg-primary text-white font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              পিডিএফ ডাউনলোড করুন (ফ্রি)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Order Modal for Bundle */}
      <QuickCheckoutModal
        product={{
          id: currentBundle.id,
          title: `${currentBundle.bundleTitle} (${filteredBooks.length}টি বই)`,
          slug: "syllabus",
          price: subtotal,
          originalPrice: originalSubtotal,
          discount: currentBundle.discountPercent,
          image: filteredBooks[0]?.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
          writer: "NCTB ও বিশেষজ্ঞ শিক্ষক পরিষদ",
        }}
        open={quickModalOpen}
        onOpenChange={setQuickModalOpen}
      />

      <Footer />
    </div>
  );
}
