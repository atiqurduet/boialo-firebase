import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  ShoppingBag,
  Zap,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  BookmarkCheck,
  Maximize2,
  Headphones,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { SecurePdfViewer } from "./SecurePdfViewer";
import { cn } from "@/lib/utils";

interface BookLookInsideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    title: string;
    author: string;
    publisher?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    description?: string;
    category?: string;
    pageCount?: number | string;
    edition?: string;
    binding?: string;
    language?: string;
  };
  pdfUrl?: string | null;
  initialTab?: "sample" | "toc" | "specs" | "pdf" | "audio";
  onAddToCart: () => void;
  onQuickCheckout: () => void;
}

export function BookLookInsideModal({
  open,
  onOpenChange,
  product,
  pdfUrl,
  initialTab,
  onAddToCart,
  onQuickCheckout,
}: BookLookInsideModalProps) {
  const [readingTheme, setReadingTheme] = useState<"light" | "sepia" | "dark">("sepia");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [activeTab, setActiveTab] = useState<"sample" | "toc" | "specs" | "pdf" | "audio">(
    initialTab || (pdfUrl ? "pdf" : "sample")
  );

  // Audio excerpt narration state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [selectedVoiceChapter, setSelectedVoiceChapter] = useState(0);

  const audioExcerpts = [
    {
      title: "ভূমিকা ও লেখকের বার্তা",
      duration: "১:১৫ মিনিট",
      text: `${product.title}। লেখক: ${product.author}। প্রকাশনী: ${product.publisher || "বইআলো প্রকাশনী"}। প্রিয় পাঠক, এই বইটিতে লেখক অত্যন্ত প্রাঞ্জল ভাষায় মানব জীবনের গভীর অনুভূতি ও বাস্তবতার চিত্র তুলে ধরেছেন। আশা করি প্রতিটি অধ্যায় আপনার চিন্তা ও অনুভূতিকে সমৃদ্ধ করবে।`,
    },
    {
      title: "প্রথম অধ্যায়ের সারসংক্ষেপ",
      duration: "১:৪০ মিনিট",
      text: product.description || `প্রথম অধ্যায়ে উন্মোচিত হয় কাহিনির মূল পটভূমি। প্রতিটি চরিত্রের নিজস্ব দ্বন্দ্ব ও সমাজের বাস্তব পরিস্থিতি পাঠকের মনে গভীর রেখাপাত করে। পুরো বইটি পড়ার মাধ্যমে উন্মোচিত হবে এর অন্তর্নিহিত সত্য।`,
    },
    {
      title: "পাঠ প্রতিক্রিয়া ও সমাপনী ভাবনা",
      duration: "০:৫০ মিনিট",
      text: `পাঠকদের মতে, ${product.title} বইটি সমসাময়িক সাহিত্যের অন্যতম একটি অনবদ্য সৃষ্টি। নিজের ব্যক্তিগত লাইব্রেরি সমৃদ্ধ করতে বইটি সংগ্রহে রাখার মতো।`,
    },
  ];

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const currentText = audioExcerpts[selectedVoiceChapter]?.text || product.title;
      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.lang = "bn-BD";
      utterance.rate = audioSpeed;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  };

  const handleStopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const themeStyles = {
    light: "bg-white text-zinc-900 border-zinc-200",
    sepia: "bg-[#fbf0d9] text-[#433422] border-[#ebd7b2]",
    dark: "bg-zinc-900 text-zinc-100 border-zinc-800",
  };

  const fontSizes = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg leading-loose",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleStopAudio();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl border-border">
        {/* Header Bar */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground line-clamp-1">
                  একটু পড়ে দেখুন — {product.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  লেখক: {product.author} {product.publisher ? `• ${product.publisher}` : ""}
                </p>
              </div>
            </div>

            {/* Reading Customization Controls */}
            {activeTab !== "pdf" && activeTab !== "audio" && (
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/60 p-1 rounded-xl text-xs">
                {/* Theme buttons */}
                <button
                  onClick={() => setReadingTheme("light")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors flex items-center gap-1",
                    readingTheme === "light" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Day Mode"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReadingTheme("sepia")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors flex items-center gap-1",
                    readingTheme === "sepia" ? "bg-[#fbf0d9] text-[#433422] font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Sepia Reading Mode"
                >
                  <Coffee className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReadingTheme("dark")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors flex items-center gap-1",
                    readingTheme === "dark" ? "bg-zinc-800 text-zinc-100 shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Dark Mode"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-border mx-1" />

                {/* Font Size buttons */}
                <button
                  onClick={() => setFontSize("sm")}
                  className={cn("px-2 py-0.5 rounded-lg font-medium", fontSize === "sm" ? "bg-card shadow-xs text-primary" : "text-muted-foreground")}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("base")}
                  className={cn("px-2 py-0.5 rounded-lg font-medium", fontSize === "base" ? "bg-card shadow-xs text-primary" : "text-muted-foreground")}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={cn("px-2 py-0.5 rounded-lg font-medium", fontSize === "lg" ? "bg-card shadow-xs text-primary" : "text-muted-foreground")}
                >
                  A+
                </button>
              </div>
            )}
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50 overflow-x-auto text-xs">
            {pdfUrl && (
              <button
                onClick={() => {
                  handleStopAudio();
                  setActiveTab("pdf");
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0",
                  activeTab === "pdf" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                পিডিএফ প্রিভিউ
              </button>
            )}
            <button
              onClick={() => {
                handleStopAudio();
                setActiveTab("sample");
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0",
                activeTab === "sample" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              নমুনা পাঠ ও অনুচ্ছেদ
            </button>
            <button
              onClick={() => setActiveTab("audio")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0",
                activeTab === "audio" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Headphones className="w-3.5 h-3.5 text-amber-500" />
              অডিও ভূমিকা শুনুন
              {isPlayingAudio && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              )}
            </button>
            <button
              onClick={() => {
                handleStopAudio();
                setActiveTab("toc");
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0",
                activeTab === "toc" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              সূচিপত্র ও বিষয়বস্তু
            </button>
            <button
              onClick={() => {
                handleStopAudio();
                setActiveTab("specs");
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0",
                activeTab === "specs" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              বইয়ের স্পেসিফিকেশন
            </button>
          </div>
        </DialogHeader>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[300px] max-h-[60vh]">
          {activeTab === "pdf" && pdfUrl ? (
            <div className="h-full">
              <SecurePdfViewer url={pdfUrl} title={product.title} />
            </div>
          ) : activeTab === "sample" ? (
            <div className={cn("p-5 sm:p-8 rounded-2xl border transition-colors shadow-xs font-serif", themeStyles[readingTheme])}>
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="border-b pb-4 text-center border-current/15">
                  <span className="text-xs uppercase tracking-widest font-sans opacity-70">নমুনা পাঠ</span>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1">{product.title}</h3>
                  <p className="text-sm opacity-80 mt-1 font-sans">{product.author}</p>
                </div>

                <div className={cn("space-y-4 font-normal", fontSizes[fontSize])}>
                  {product.description ? (
                    product.description.split("\n\n").map((para, i) => (
                      <p key={i} className="first-letter:text-2xl first-letter:font-bold first-letter:float-left first-letter:mr-1">
                        {para}
                      </p>
                    ))
                  ) : (
                    <>
                      <p>
                        বইটি পাঠকদের জন্য একটি গভীর চিন্তা-উদ্দীপক ও তথ্যবহুল সাহিত্য সৃষ্টি। লেখক প্রাঞ্জল ভাষা ও সাবলীল উপস্থাপনার মাধ্যমে পাঠকদের সামনে বিষয়বস্তু অত্যন্ত দক্ষতার সাথে ফুটিয়ে তুলেছেন।
                      </p>
                      <p>
                        অধ্যায়ভিত্তিক আলোচনার মধ্য দিয়ে বইটি প্রতিটি পাঠককে নতুন দৃষ্টিকোণ ও জ্ঞানের সন্ধানে অনুপ্রাণিত করে। বইটির প্রতিটি পৃষ্ঠায় রয়েছে চিন্তার খোরাক ও বাস্তব জীবনের বহু মূল্যবান দিকনির্দেশনা।
                      </p>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-current/5 text-center text-xs font-sans mt-8 border border-current/10">
                  📖 আপনি বইটির প্রাথমিক নমুনা অংশ পড়ছেন। সম্পূর্ণ বইটি পড়ার জন্য এখনই অর্ডার করুন।
                </div>
              </div>
            </div>
          ) : activeTab === "audio" ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Player Box */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-primary/10 border border-amber-500/20 backdrop-blur-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Book Thumbnail with Sound Indicator */}
                  <div className="relative shrink-0 w-28 h-36 rounded-xl overflow-hidden shadow-lg border border-border/60 bg-muted">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {isPlayingAudio && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex items-end gap-1 h-6">
                          <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.1s] h-5" />
                          <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:0.3s] h-3" />
                          <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s] h-6" />
                          <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:0.4s] h-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Controls & Info */}
                  <div className="flex-1 w-full text-center sm:text-left space-y-3">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        বইআলো অডিও ভূমিকা
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {audioExcerpts[selectedVoiceChapter].duration}
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-foreground">
                      {audioExcerpts[selectedVoiceChapter].title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {product.title} • {product.author}
                    </p>

                    {/* Audio Waves Simulation */}
                    <div className="flex items-center justify-center sm:justify-start gap-1 py-1">
                      {[40, 65, 25, 80, 50, 95, 30, 70, 85, 45, 60, 90, 35, 75, 55, 100, 40, 80, 60, 30].map((h, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1 rounded-full transition-all duration-300",
                            isPlayingAudio ? "bg-amber-500" : "bg-muted-foreground/30"
                          )}
                          style={{
                            height: isPlayingAudio ? `${Math.max(8, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : "6px",
                            maxHeight: "26px",
                          }}
                        />
                      ))}
                    </div>

                    {/* Play Button & Controls */}
                    <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                      <button
                        onClick={handleToggleAudio}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all flex items-center justify-center"
                        title={isPlayingAudio ? "পজ করুন" : "শুনুন"}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Speed toggle */}
                      <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border text-xs">
                        {[0.8, 1, 1.25].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => {
                              setAudioSpeed(speed);
                              if (isPlayingAudio) {
                                handleStopAudio();
                              }
                            }}
                            className={cn(
                              "px-2 py-1 rounded font-medium transition-colors",
                              audioSpeed === speed
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>

                      {isPlayingAudio && (
                        <button
                          onClick={handleStopAudio}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                          title="থামান"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter Selector */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  অধ্যায় নির্বাচন করুন:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {audioExcerpts.map((excerpt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleStopAudio();
                        setSelectedVoiceChapter(idx);
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between gap-1",
                        selectedVoiceChapter === idx
                          ? "border-amber-500/80 bg-amber-500/10 font-semibold text-foreground shadow-xs"
                          : "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                      )}
                    >
                      <span className="line-clamp-1">{excerpt.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {excerpt.duration}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Narration Transcript */}
              <div className="p-4 sm:p-5 rounded-xl border border-border bg-muted/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Volume2 className="w-3.5 h-3.5 text-primary" />
                  অডিও ট্রাঙ্কস্ক্রিপ্ট ও বিবরণ:
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-serif">
                  "{audioExcerpts[selectedVoiceChapter].text}"
                </p>
              </div>
            </div>
          ) : activeTab === "toc" ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-muted/40 p-4 rounded-xl border border-border">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                  সূচিপত্র ও অধ্যায়সমূহ
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    "ভূমিকা ও লেখকের কথা",
                    "প্রথম অধ্যায়: প্রাথমিক ভিত্তি ও প্রেক্ষাপট",
                    "দ্বিতীয় অধ্যায়: ঐতিহাসিক পর্যালোচনা ও প্রাসঙ্গিকতা",
                    "তৃতীয় অধ্যায়: মূল তত্ত্ব ও বিশ্লেষণী আলোচনা",
                    "চতুর্থ অধ্যায়: আধুনিক প্রেক্ষিত ও জীবনবোধ",
                    "পঞ্চম অধ্যায়: মূল্যায়ন ও সমাপনী ভাবনা",
                    "পরিশিষ্ট ও তথ্যসূত্র",
                  ].map((chapter, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-card transition-colors border-b border-border/40 last:border-0"
                    >
                      <span className="text-foreground">{chapter}</span>
                      <span className="text-xs text-muted-foreground font-mono">পৃষ্ঠা {idx * 25 + 9}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-muted-foreground">বইয়ের নাম:</span>
                  <span className="font-medium text-foreground">{product.title}</span>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-muted-foreground">লেখক:</span>
                  <span className="font-medium text-foreground">{product.author}</span>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-muted-foreground">প্রকাশনী:</span>
                  <span className="font-medium text-foreground">{product.publisher || "বইআলো প্রকাশনী"}</span>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-muted-foreground">ভাষা:</span>
                  <span className="font-medium text-foreground">{product.language || "বাংলা"}</span>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-muted-foreground">বাঁধাই:</span>
                  <span className="font-medium text-foreground">{product.binding || "হার্ডকভার"}</span>
                </div>
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-muted-foreground">সংস্করণ:</span>
                  <span className="font-medium text-foreground">{product.edition || "১ম প্রকাশ"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-baseline gap-2 self-start sm:self-auto">
            <span className="text-2xl font-bold text-primary">৳{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.originalPrice}
              </span>
            )}
            {product.discount && (
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                {product.discount}% ছাড়
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial h-10 px-4 text-sm font-medium gap-2"
              onClick={() => {
                onAddToCart();
                onOpenChange(false);
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              কার্টে যোগ করুন
            </Button>
            <button
              onClick={() => {
                onOpenChange(false);
                onQuickCheckout();
              }}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              দ্রুত অর্ডার করুন
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
