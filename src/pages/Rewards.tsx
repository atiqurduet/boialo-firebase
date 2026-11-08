import { useState } from "react";
import { DailyCheckin } from "@/components/gamification/DailyCheckin";
import { SpinWheel } from "@/components/gamification/SpinWheel";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";
import { CustomerReferralWallet } from "@/components/CustomerReferralWallet";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Gift, Sparkles, Trophy, Users } from "lucide-react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Rewards() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("wallet");

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <div className="container max-w-5xl py-6 md:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  রিওয়ার্ডস ও রেফারাল হাব
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  বন্ধু আমন্ত্রণ বোনাস, প্রতি অর্ডারে পয়েন্ট, স্পিন হুইল ও ফ্রি হোম ডেলিভারি
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md h-12 p-1 rounded-xl bg-muted/80">
              <TabsTrigger value="wallet" className="rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <Users className="w-4 h-4" /> রেফারাল ও পয়েন্ট ওয়ালেট
              </TabsTrigger>
              <TabsTrigger value="games" className="rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> ডেইলি গেম ও ব্যাজ
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Referral & Wallet */}
            <TabsContent value="wallet" className="space-y-6 mt-4">
              <CustomerReferralWallet />
            </TabsContent>

            {/* Tab 2: Gamification / Check-in & Spin Wheel */}
            <TabsContent value="games" className="space-y-6 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <DailyCheckin />
                </div>
                <SpinWheel />
              </div>

              <div className="mt-6">
                <AchievementBadges />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
