import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { CustomComboBuilder } from '@/components/CustomComboBuilder';
import { TrustBadges } from '@/components/TrustBadges';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';

const ComboBuilder: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="কাস্টম কম্বো মেকার - নিজের পছন্দের বইয়ে অতিরিক্ত ছাড় | বইআলো"
        description="পছন্দের যেকোনো ২টি বা ৩টি বই নির্বাচন করে আপনার নিজস্ব কম্বো বানিয়ে নিন এবং স্বয়ংক্রিয়ভাবে পান ১০% অতিরিক্ত বিশেষ ছাড়!"
        canonicalUrl="https://boialo.com/combo-builder"
      />
      <AnnouncementBar />
      <Header />

      <main className="container py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-primary">হোম</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/bundles" className="hover:text-primary">বান্ডেল</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">কাস্টম কম্বো মেকার</span>
        </nav>

        {/* Builder Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-indigo-700 to-purple-800 p-6 md:p-10 text-white mb-6 shadow-xl">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্মার্ট কম্বো সেভার বিল্ডার</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-xs">
              নিজের পছন্দের বইয়ের কম্বো তৈরি করুন
            </h1>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              একসাথে একাধিক বই অর্ডার করে ডেলিভারি ও মূল্যের উপর সর্বোচ্চ ছাড় উপভোগ করুন। আপনার নির্বাচিত প্রতিটি বইয়ে সাথে সাথেই কম্বো ডিসকাউন্ট কার্যকর হবে!
            </p>
          </div>
        </div>

        {/* The Interactive Builder Component */}
        <CustomComboBuilder />

        {/* Trust Badges */}
        <div className="my-8">
          <TrustBadges />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComboBuilder;
