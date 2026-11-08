import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
}

interface SyllabusBundle {
  id: string;
  institutionType: "bangla" | "english" | "madrasa" | "college";
  grade: string;
  gradeLabel: string;
  bundleTitle: string;
  description: string;
  discountPercent: number;
  books: SyllabusBook[];
}

const BUNDLE_DATA: SyllabusBundle[] = [
  {
    id: "bangla-class-5",
    institutionType: "bangla",
    grade: "5",
    gradeLabel: "৫ম শ্রেণি",
    bundleTitle: "৫ম শ্রেণি সম্পূর্ণ পাঠ্যবই ও মডেল টেস্ট সেট (২০২৬)",
    description: "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত ৫ম শ্রেণির সব বিষয়ের সম্পূর্ণ নতুন বইয়ের সেট।",
    discountPercent: 12,
    books: [
      { id: "b5-1", title: "আমার বাংলা বই — ৫ম শ্রেণি", subject: "বাংলা", price: 110, originalPrice: 125, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
      { id: "b5-2", title: "English for Today — Class 5", subject: "ইংরেজি", price: 120, originalPrice: 135, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80" },
      { id: "b5-3", title: "প্রাথমিক গণিত — ৫ম শ্রেণি", subject: "গণিত", price: 130, originalPrice: 145, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80" },
      { id: "b5-4", title: "প্রাথমিক বিজ্ঞান — ৫ম শ্রেণি", subject: "বিজ্ঞান", price: 125, originalPrice: 140, image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80" },
      { id: "b5-5", title: "বাংলাদেশ ও বিশ্বপরিচয় — ৫ম শ্রেণি", subject: "সমাজ", price: 115, originalPrice: 130, image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80" },
      { id: "b5-6", title: "ইসলাম ও নৈতিক শিক্ষা — ৫ম শ্রেণি", subject: "ধর্ম", price: 100, originalPrice: 115, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80" },
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
    books: [
      { id: "b6-1", title: "বাংলা — ৬ষ্ঠ শ্রেণি (নতুন কারিকুলাম)", subject: "বাংলা", price: 140, originalPrice: 160, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
      { id: "b6-2", title: "English — Class 6", subject: "ইংরেজি", price: 150, originalPrice: 170, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80" },
      { id: "b6-3", title: "গণিত — ৬ষ্ঠ শ্রেণি", subject: "গণিত", price: 160, originalPrice: 180, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80" },
      { id: "b6-4", title: "বিজ্ঞান (অনুসন্ধানী ও অনুশীলন পাঠ)", subject: "বিজ্ঞান", price: 170, originalPrice: 195, image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80" },
      { id: "b6-5", title: "ডিজিটাল প্রযুক্তি — ৬ষ্ঠ শ্রেণি", subject: "আইসিটি", price: 120, originalPrice: 135, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80" },
      { id: "b6-6", title: "ইতিহাস ও সামাজিক বিজ্ঞান", subject: "সমাজ", price: 130, originalPrice: 145, image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80" },
    ],
  },
  {
    id: "bangla-class-9",
    institutionType: "bangla",
    grade: "9",
    gradeLabel: "৯ম-১০ম শ্রেণি (বিজ্ঞান)",
    bundleTitle: "৯ম-১০ম শ্রেণি বিজ্ঞান বিভাগ সম্পূর্ণ পাঠ্যবই ও সহায়ক সেট",
    description: "পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিত সহ SSC বিজ্ঞান বিভাগের আবশ্যকীয় পূর্ণ সেট।",
    discountPercent: 15,
    books: [
      { id: "b9-1", title: "পদার্থবিজ্ঞান — ৯ম-১০ম শ্রেণি", subject: "পদার্থবিজ্ঞান", price: 190, originalPrice: 220, image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80" },
      { id: "b9-2", title: "রসায়ন — ৯ম-১০ম শ্রেণি", subject: "রসায়ন", price: 195, originalPrice: 225, image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80" },
      { id: "b9-3", title: "জীববিজ্ঞান — ৯ম-১০ম শ্রেণি", subject: "জীববিজ্ঞান", price: 185, originalPrice: 215, image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&auto=format&fit=crop&q=80" },
      { id: "b9-4", title: "উচ্চতর গণিত — ৯ম-১০ম শ্রেণি", subject: "উচ্চতর গণিত", price: 210, originalPrice: 240, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80" },
      { id: "b9-5", title: "বাংলা সাহিত্য ও সহপাঠ — ৯ম-১০ম", subject: "বাংলা", price: 160, originalPrice: 180, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
      { id: "b9-6", title: "English Grammar and Composition", subject: "ইংরেজি", price: 175, originalPrice: 200, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80" },
    ],
  },
  {
    id: "madrasa-dakhil-9",
    institutionType: "madrasa",
    grade: "dakhil",
    gradeLabel: "দাখিল ৯ম-১০ম",
    bundleTitle: "দাখিল ৯ম-১০ম শ্রেণি সাধারণ ও আরবি বিষয় পূর্ণাঙ্গ সেট",
    description: "কুরআন মাজীদ, হাদিস শরীফ, আরবি ১ম-২য় পত্র এবং সাধারণ বিষয়াবলীর অনুমোদিত সেট।",
    discountPercent: 12,
    books: [
      { id: "m9-1", title: "কুরআন মাজীদ ও তাজবীদ — দাখিল ৯ম-১০ম", subject: "কুরআন", price: 160, originalPrice: 180, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80" },
      { id: "m9-2", title: "হাদিস শরীফ — দাখিল ৯ম-১০ম", subject: "হাদিস", price: 170, originalPrice: 190, image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80" },
      { id: "m9-3", title: "আল লুগাতুল আরাবিয়্যাতুল ইত্তেসালিয়্যাহ (আরবি ১ম)", subject: "আরবি", price: 155, originalPrice: 175, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80" },
      { id: "m9-4", title: "কাওয়াইদুল লুগাতিল আরাবিয়্যাহ (আরবি ব্যাকরণ)", subject: "আরবি", price: 150, originalPrice: 170, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80" },
      { id: "m9-5", title: "সাধারণ গণিত — দাখিল ৯ম-১০ম", subject: "গণিত", price: 160, originalPrice: 180, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80" },
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
    books: [
      { id: "c-1", title: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র (প্রফেসর মো. আমির হোসেন)", subject: "পদার্থবিজ্ঞান", price: 420, originalPrice: 480, image: "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80" },
      { id: "c-2", title: "রসায়ন ১ম ও ২য় পত্র (প্রফেসর মো. আবুল কালাম আজাদ)", subject: "রসায়ন", price: 440, originalPrice: 500, image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80" },
      { id: "c-3", title: "জীববিজ্ঞান ১ম ও ২য় পত্র (প্রফেসর ড. মোহাম্মদ আবুল হাসান)", subject: "জীববিজ্ঞান", price: 430, originalPrice: 490, image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&auto=format&fit=crop&q=80" },
      { id: "c-4", title: "উচ্চতর গণিত ১ম ও ২য় পত্র (প্রফেসর অসীম কুমার সাহা)", subject: "উচ্চতর গণিত", price: 450, originalPrice: 520, image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80" },
      { id: "c-5", title: "তথ্য ও যোগাযোগ প্রযুক্তি — একাদশ-দ্বাদশ", subject: "আইসিটি", price: 280, originalPrice: 320, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80" },
    ],
  },
];

export default function SyllabusBundles() {
  const [selectedType, setSelectedType] = useState<"bangla" | "english" | "madrasa" | "college">("bangla");
  const [selectedBundleId, setSelectedBundleId] = useState<string>("bangla-class-5");
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([
    "b5-1", "b5-2", "b5-3", "b5-4", "b5-5", "b5-6"
  ]);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const { addToCart } = useCartContext();
  const navigate = useNavigate();

  const currentBundle = BUNDLE_DATA.find((b) => b.id === selectedBundleId) || BUNDLE_DATA[0];

  const handleSelectBundle = (bundle: SyllabusBundle) => {
    setSelectedBundleId(bundle.id);
    setSelectedBookIds(bundle.books.map((b) => b.id));
  };

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

  const filteredBooks = currentBundle.books.filter((b) => selectedBookIds.includes(b.id));
  const subtotal = filteredBooks.reduce((sum, b) => sum + b.price, 0);
  const originalSubtotal = filteredBooks.reduce((sum, b) => sum + b.originalPrice, 0);
  const savings = originalSubtotal - subtotal;

  const handleAddAllToCart = () => {
    filteredBooks.forEach((book) => {
      addToCart({
        id: book.id,
        title: book.title,
        price: book.price,
        originalPrice: book.originalPrice,
        image: book.image,
        author: "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড",
        category: "সিলেবাস বই",
      });
    });
    toast.success(`সিলেবাসের ${filteredBooks.length}টি বই কার্টে যোগ করা হয়েছে!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="স্কুল, কলেজ ও মাদ্রাসার সিলেবাস বুকসেট বান্ডেল — বইআলো"
        description="১ম থেকে দ্বাদশ শ্রেণির নতুন শিক্ষাক্রমের সকল পাঠ্যবই এবং গাইড বইয়ের সম্পূর্ণ সেট একসাথে ঘরে বসে আকর্ষণীয় ছাড়ে অর্ডার করুন।"
      />
      <AnnouncementBar />
      <Header />

      <main className="container max-w-6xl py-8 md:py-12 space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-primary p-6 sm:p-10 text-white overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
              ২০২৬ শিক্ষাক্রমের সম্পূর্ণ সিলেবাস বই
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              শ্রেণিভিত্তিক পূর্ণাঙ্গ পাঠ্যবই সেট — এক ক্লিকে সম্পূর্ণ বান্ডেল
            </h1>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              স্কুল, কলেজ ও মাদ্রাসার সব বিষয়ের বই আলাদা আলাদা না খুঁজে একসাথে ঘরে বসেই সংগ্রহ করুন। বিশেষ বান্ডেল ডিসকাউন্ট ও দ্রুত হোম ডেলিভারি!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-white/80">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Truck className="w-3.5 h-3.5 text-amber-300" />
                ৪৯৯৳+ অর্ডারে ফ্রি ডেলিভারি
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                ১০০% নতুন ও নির্ভুল সংস্করণ
              </span>
            </div>
          </div>
        </div>

        {/* Institution Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: "bangla" as const, label: "বাংলা মাধ্যম (NCTB)", icon: School },
            { id: "madrasa" as const, label: "মাদ্রাসা শিক্ষা বোর্ড", icon: BookOpen },
            { id: "college" as const, label: "কলেজ / HSC (একাদশ-দ্বাদশ)", icon: GraduationCap },
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
                  "px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shrink-0 border",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Class Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {BUNDLE_DATA.filter((b) => b.institutionType === selectedType).map((bundle) => {
            const isSelected = bundle.id === selectedBundleId;
            return (
              <button
                key={bundle.id}
                onClick={() => handleSelectBundle(bundle)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border shrink-0",
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs"
                    : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {bundle.gradeLabel}
                <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ({bundle.discountPercent}% ছাড়)
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Bundle Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Books List (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{currentBundle.bundleTitle}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{currentBundle.description}</p>
              </div>
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30">
                {filteredBooks.length}টি বই নির্বাচিত
              </Badge>
            </div>

            <div className="space-y-2.5">
              {currentBundle.books.map((book) => {
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
                        className="w-12 h-16 object-cover rounded-md border border-border shrink-0 bg-muted"
                      />

                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          {book.subject}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{book.title}</h4>
                        <p className="text-xs text-muted-foreground">জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড</p>
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
            </div>
          </div>

          {/* Sticky Summary & Checkout Card (1 col) */}
          <div className="lg:col-span-1 sticky top-24 space-y-4">
            <Card className="rounded-2xl border-border shadow-md overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-primary/10 via-amber-500/5 to-card border-b border-border space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  বান্ডেল প্যাকেজ বিবরণ
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
                    <span>{subtotal >= 499 ? "ফ্রি (০৳)" : "৳৬০"}</span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-baseline font-bold text-lg">
                    <span>সর্বমোট প্রদেয়</span>
                    <span className="text-primary text-2xl font-extrabold">৳{subtotal}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2.5">
                  <Button
                    onClick={() => setQuickModalOpen(true)}
                    className="w-full h-11 text-sm font-bold rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md active:scale-[0.98] transition-all"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    ১-ক্লিকে ইনস্ট্যান্ট অর্ডার করুন
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleAddAllToCart}
                    className="w-full h-10 text-xs font-semibold rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    সবগুলো কার্টে যোগ করুন
                  </Button>
                </div>

                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground space-y-1 border border-border">
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ক্যাশ অন ডেলিভারি সুবিধা
                  </p>
                  <p>বই হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন।</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

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
