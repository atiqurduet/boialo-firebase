import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CustomerReferralWallet } from "@/components/CustomerReferralWallet";
import { Users, Gift } from "lucide-react";

export default function Referral() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <div className="container max-w-5xl py-6 md:py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                গ্রাহক রেফারাল ও ফ্রেন্ড ইনভাইট ওয়ালেট
              </h1>
              <p className="text-sm text-muted-foreground">
                বন্ধুকে রেফার করলেই দুজনের জন্য ৫০ পয়েন্ট বোনাস এবং প্রতি অর্ডারে পয়েন্ট অর্জন
              </p>
            </div>
          </div>

          <CustomerReferralWallet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
