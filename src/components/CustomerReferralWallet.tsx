import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Gift,
  Share2,
  Copy,
  Check,
  Truck,
  DollarSign,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

export const CustomerReferralWallet = () => {
  const { user } = useAuth();
  const {
    totalPoints,
    transactions,
    referralCode,
    totalReferrals,
    settings,
    loading,
    redeemFreeDelivery,
    applyReferralCode,
    getPointsValue,
  } = useLoyaltyPoints();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isRedeemingDelivery, setIsRedeemingDelivery] = useState(false);

  if (!user) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold">গ্রাহক রেফারাল ও ফ্রেন্ড ইনভাইট ওয়ালেট</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
          বন্ধুকে রেফার করলে দুজনের জন্যই ৫০ পয়েন্ট বোনাস! লগইন করে আপনার ইউনিক রেফারাল কোড সংগ্রহ করুন এবং প্রতি অর্ডারে পয়েন্ট অর্জন করুন।
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/signin">লগইন করুন</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/signin?tab=signup">নতুন অ্যাকাউন্ট খুলুন</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://boialo.com";
  const inviteUrl = `${siteOrigin}/signin?ref=${referralCode || ""}`;
  const shareText = `বইআলো (Boialo) থেকে বই কিনুন এবং আমার রেফারাল কোড ${referralCode} ব্যবহার করে সাথে সাথে ৫০ পয়েন্ট বোনাস পান! ফ্রি হোম ডেলিভারি ও বিশেষ ছাড় উপভোগ করতে ভিজিট করুন: ${inviteUrl}`;

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      toast.success("রেফারাল কোড কপি হয়েছে!");
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      toast.success("ইনভাইট লিংক কপি হয়েছে!");
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleApplyFriendCode = async () => {
    if (!friendCodeInput.trim()) {
      toast.error("বন্ধুর রেফারাল কোড দিন");
      return;
    }
    setIsApplying(true);
    const res = await applyReferralCode(friendCodeInput);
    if (res.success) {
      toast.success(res.message);
      setFriendCodeInput("");
    } else {
      toast.error(res.message);
    }
    setIsApplying(false);
  };

  const handleClaimFreeDelivery = async () => {
    setIsRedeemingDelivery(true);
    await redeemFreeDelivery();
    setIsRedeemingDelivery(false);
  };

  const freeDeliveryThreshold = settings.free_delivery_points || 60;
  const canClaimFreeDelivery = totalPoints >= freeDeliveryThreshold;

  return (
    <div className="space-y-6">
      {/* ===== HERO WALLET STATUS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Point Balance */}
        <Card className="md:col-span-2 border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 relative overflow-hidden shadow-sm">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/15 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 font-semibold">
                    <Sparkles className="w-3 h-3 mr-1" /> লয়্যালটি ও রেফারাল ওয়ালেট
                  </Badge>
                  <span className="text-xs text-muted-foreground">১ পয়েন্ট = ১ টাকা</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-2 tracking-tight">
                  {loading ? "..." : totalPoints}{" "}
                  <span className="text-xl sm:text-2xl font-semibold text-primary">পয়েন্ট</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  বর্তমান আর্থিক মূল্য:{" "}
                  <strong className="text-foreground font-bold">৳{getPointsValue(totalPoints)}</strong>
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Button
                  onClick={handleClaimFreeDelivery}
                  disabled={!canClaimFreeDelivery || isRedeemingDelivery}
                  variant={canClaimFreeDelivery ? "default" : "outline"}
                  className="rounded-xl shadow-sm text-xs font-semibold"
                >
                  <Truck className="w-3.5 h-3.5 mr-1.5" />
                  ফ্রি হোম ডেলিভারি ({freeDeliveryThreshold}পয়েন্ট)
                </Button>
                <Button variant="secondary" asChild className="rounded-xl text-xs font-semibold">
                  <Link to="/shop">
                    বই কিনুন ও পয়েন্ট আয় করুন <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">রেফারাল বোনাস</p>
                <p className="font-bold text-foreground text-sm">+{settings.referral_bonus || 50} পয়েন্ট / রেফার</p>
              </div>
              <div>
                <p className="text-muted-foreground">প্রতি অর্ডারে উপার্জন</p>
                <p className="font-bold text-foreground text-sm">প্রতি ৫০৳ এ ১ পয়েন্ট</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-muted-foreground">মোট বন্ধু আমন্ত্রিত</p>
                <p className="font-bold text-foreground text-sm">{totalReferrals} জন পাঠক</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free Delivery Voucher Status */}
        <Card className="border-border bg-card flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              ফ্রি হোম ডেলিভারি
            </CardTitle>
            <CardDescription className="text-xs">
              ৬০ পয়েন্ট থাকলে যেকোনো বইয়ের অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="p-3 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">প্রয়োজনীয় পয়েন্ট:</span>
              <span className="font-bold text-foreground">{freeDeliveryThreshold} পয়েন্ট</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>পয়েন্ট প্রগ্রেস</span>
                <span className="font-medium text-foreground">
                  {Math.min(totalPoints, freeDeliveryThreshold)} / {freeDeliveryThreshold}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalPoints / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {canClaimFreeDelivery ? (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> আপনি এখনই ফ্রি ডেলিভারি নিতে প্রস্তুত!
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                আর মাত্র <strong>{freeDeliveryThreshold - totalPoints} পয়েন্ট</strong> অর্জন করলেই ফ্রি হোম ডেলিভারি!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== FRIEND INVITE & REFERRAL SECTION ===== */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                বন্ধুকে ইনভাইট করুন — দুজনেই পাবেন ৫০ পয়েন্ট ভাউচার!
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                আপনার রেফারাল কোড বা লিংক দিয়ে কোনো বন্ধু একাউন্ট খুলে প্রথম বই কিনলেই, দুজনের ওয়ালেটেই ৫০ পয়েন্ট করে জমা হবে।
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs w-fit">
              ৫০ পয়েন্ট = ৫০ টাকা
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Share Code & Link Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referral Code Box */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                আপনার ইউনিক রেফারাল কোড:
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background font-mono text-base font-extrabold tracking-wider px-3.5 py-2 rounded-lg border border-border select-all text-center">
                  {referralCode || "লোড হচ্ছে..."}
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(referralCode, "code")}
                  className="rounded-lg shrink-0"
                >
                  {copiedCode ? <Check className="w-4 h-4 mr-1 text-emerald-300" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copiedCode ? "কপি হয়েছে!" : "কোড কপি"}
                </Button>
              </div>
            </div>

            {/* Referral Link Box */}
            <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                সরাসরি ইনভাইট লিংক:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="bg-background text-xs font-mono h-10 select-all"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(inviteUrl, "link")}
                  className="rounded-lg shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Share2 className="w-4 h-4 mr-1" />}
                  {copiedLink ? "কপি হয়েছে!" : "লিংক কপি"}
                </Button>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-muted-foreground mr-1">সোশ্যালে শেয়ার করুন:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShareWhatsApp}
              className="text-xs rounded-xl border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShareFacebook}
              className="text-xs rounded-xl border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2]/10"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Facebook
            </Button>
          </div>

          {/* How it works 3-step banner */}
          <div className="p-4 rounded-2xl bg-muted/50 border border-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                ১
              </div>
              <div>
                <p className="font-bold text-foreground">লিংক বা কোড পাঠান</p>
                <p className="text-muted-foreground mt-0.5">আপনার বইপ্রেমী বন্ধুকে আপনার রেফারাল লিংক বা কোড শেয়ার করুন।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                ২
              </div>
              <div>
                <p className="font-bold text-foreground">বন্ধু বই কিনলে বোনাস</p>
                <p className="text-muted-foreground mt-0.5">বন্ধু অ্যাকাউন্ট খুলে প্রথম অর্ডার করলেই আপনি ও বন্ধু দুজনেই ৫০ পয়েন্ট পাবেন।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                ৩
              </div>
              <div>
                <p className="font-bold text-foreground">টাকায় কনভার্ট বা ফ্রি ডেলিভারি</p>
                <p className="text-muted-foreground mt-0.5">পয়েন্ট দিয়ে ফ্রি ডেলিভারি নিন অথবা ১ পয়েন্ট = ১ টাকা হিসেবে বিল থেকে ছাড় নিন।</p>
              </div>
            </div>
          </div>

          {/* Friend Referral Code Redemption Box */}
          <div className="pt-2 border-t border-border">
            <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-accent/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-primary" /> কোনো বন্ধুর রেফারাল কোড আছে?
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    বন্ধুর কোড বসালে আপনি ও আপনার বন্ধু দুজনেই সাথে সাথে ৫০ পয়েন্ট বোনাস পাবেন!
                  </p>
                </div>
                <div className="flex items-center gap-2 max-w-sm w-full">
                  <Input
                    placeholder="যেমন: BOI-XYZ1234"
                    value={friendCodeInput}
                    onChange={(e) => setFriendCodeInput(e.target.value)}
                    className="h-9 uppercase font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleApplyFriendCode}
                    disabled={isApplying || !friendCodeInput.trim()}
                    className="shrink-0 h-9 rounded-lg"
                  >
                    {isApplying ? "যাচাই..." : "পয়েন্ট নিন"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== HOW TO EARN MORE POINTS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              প্রতি অর্ডারে পয়েন্ট অর্জন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">প্রতি ৫০ বা ১০০ টাকার কেনাকাটায়</p>
                <p className="text-muted-foreground text-[11px]">স্বয়ংক্রিয়ভাবে কার্ট অনুযায়ী পয়েন্ট জমা হবে</p>
              </div>
              <Badge variant="secondary" className="font-bold">+১ থেকে +১০ পয়েন্ট</Badge>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">বই রিভিউ ও রেটিং লিখলে</p>
                <p className="text-muted-foreground text-[11px]">পড়ে রিভিউ শেয়ার করলেই বোনাস পয়েন্ট</p>
              </div>
              <Badge variant="secondary" className="font-bold">+১০ পয়েন্ট</Badge>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">ডেইলি চেক-ইন ও স্পিন হুইল</p>
                <p className="text-muted-foreground text-[11px]">প্রতিদিন রিওয়ার্ডস পেজে এসে পয়েন্ট জিতুন</p>
              </div>
              <Badge variant="secondary" className="font-bold">+৫ থেকে +৫০ পয়েন্ট</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              পয়েন্ট ব্যবহারের সহজ নিয়ম
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary" /> ফ্রি হোম ডেলিভারিতে রূপান্তর
              </p>
              <p className="text-muted-foreground text-[11px] mt-1">
                চেকআউট পেজে মাত্র ৬০ পয়েন্ট রিডিম করলেই সারা বাংলাদেশে বইয়ের ডেলিভারি চার্জ সম্পূর্ণ ০ টাকা হয়ে যাবে।
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> চেকআউটে সরাসরি টাকার ছাড়
              </p>
              <p className="text-muted-foreground text-[11px] mt-1">
                ১ পয়েন্ট = ১ টাকা। আপনার অ্যাকাউন্টে যত পয়েন্ট আছে, চেকআউটে সেই পরিমাণ সরাসরি মূল্যছাড় হিসেবে কেটে নেওয়া যায়।
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== TRANSACTION LEDGER / HISTORY ===== */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            পয়েন্ট লেনদেন ইতিহাস
          </CardTitle>
          <CardDescription className="text-xs">
            আপনার অ্যাকাউন্টে অর্জিত ও রিডিম করা সকল পয়েন্টের লেজার
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
              <Gift className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p>আপনার অ্যাকাউন্টে এখনও কোনো পয়েন্ট লেনদেন হয়নি।</p>
              <p className="text-[11px]">বন্ধুকে ইনভাইট করে অথবা প্রথম অর্ডার দিয়ে পয়েন্ট অর্জন শুরু করুন!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{tx.description || tx.source}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-bold text-sm ${
                        tx.type === "earned" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {tx.type === "earned" ? "+" : "-"}
                      {tx.points} পয়েন্ট
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {tx.type === "earned" ? "অর্জিত" : "রিডিম"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
