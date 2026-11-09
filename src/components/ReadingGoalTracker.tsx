import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Plus, CheckCircle2, Bookmark, Star, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShelfBook {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'completed' | 'want_to_read';
  rating?: number;
  completedAt?: string;
}

export const ReadingGoalTracker: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['reading-goal-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['reading_goal_enabled', 'reading_goal_year']);
      const mapped: Record<string, any> = {};
      data?.forEach((d) => {
        mapped[d.setting_key] = d.setting_value;
      });
      return mapped;
    },
  });

  const isEnabled = settings?.reading_goal_enabled !== false && settings?.reading_goal_enabled !== 'false';
  const goalYear = settings?.reading_goal_year || '২০২৬';

  const [targetGoal, setTargetGoal] = useState<number>(() => {
    const saved = localStorage.getItem('boialo_reading_goal_target');
    return saved ? Number(saved) : 12;
  });

  const [books, setBooks] = useState<ShelfBook[]>(() => {
    const saved = localStorage.getItem('boialo_reading_shelf');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      { id: '1', title: 'প্যারাডক্সিক্যাল সাজিদ', author: 'আরিফ আজাদ', status: 'completed', rating: 5, completedAt: 'জানুয়ারি ২০২৬' },
      { id: '2', title: 'বেলা ফুরাবার আগে', author: 'আরিফ আজাদ', status: 'completed', rating: 5, completedAt: 'ফেব্রুয়ারি ২০২৬' },
      { id: '3', title: 'সায়াহ্ন', author: 'হুমায়ূন আহমেদ', status: 'reading' },
    ];
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState(String(targetGoal));
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'completed' | 'want_to_read'>('all');

  useEffect(() => {
    localStorage.setItem('boialo_reading_shelf', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('boialo_reading_goal_target', String(targetGoal));
  }, [targetGoal]);

  if (!isEnabled) return null;

  const completedBooks = books.filter((b) => b.status === 'completed');
  const percent = Math.min(100, Math.round((completedBooks.length / Math.max(1, targetGoal)) * 100));

  const handleSaveGoal = () => {
    const num = parseInt(newTargetInput, 10);
    if (!isNaN(num) && num > 0) {
      setTargetGoal(num);
      setIsEditingGoal(false);
      toast.success(`${goalYear} সালের বই পড়ার টার্গেট ${num}টিতে আপডেট হয়েছে!`);
    }
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const newBook: ShelfBook = {
      id: 'book-' + Date.now(),
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || 'অজানা লেখক',
      status: 'reading',
    };

    setBooks([newBook, ...books]);
    setNewBookTitle('');
    setNewBookAuthor('');
    toast.success(`'${newBook.title}' আপনার রিডিং শেলফে যোগ হয়েছে!`);
  };

  const handleMarkCompleted = (id: string) => {
    setBooks(
      books.map((b) =>
        b.id === id
          ? { ...b, status: 'completed', completedAt: new Date().toLocaleDateString('bn-BD', { month: 'short', year: 'numeric' }) }
          : b
      )
    );
    toast.success('অভিনন্দন! বইটি পড়া সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে! 🎉');
  };

  const filteredBooks = books.filter((b) => (activeTab === 'all' ? true : b.status === activeTab));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>বার্ষিক পাঠক চ্যালেঞ্জ {goalYear}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">আপনার বুক রিডিং গোল</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            প্রতিটি পঠিত বই আপনার জ্ঞান ও রিওয়ার্ড পয়েন্ট সমৃদ্ধ করে
          </p>
        </div>

        {/* Target Setter */}
        <div className="flex items-center gap-2">
          {isEditingGoal ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="365"
                value={newTargetInput}
                onChange={(e) => setNewTargetInput(e.target.value)}
                className="w-20 h-9 text-xs font-bold"
              />
              <Button size="sm" onClick={handleSaveGoal} className="h-9 text-xs">
                সেভ
              </Button>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">টার্গেট: {targetGoal}টি বই</div>
              <button
                onClick={() => setIsEditingGoal(true)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                টার্গেট পরিবর্তন করুন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/10 border border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            চলতি বছরের অগ্রগতি: {completedBooks.length} / {targetGoal}টি বই পড়া শেষ
          </span>
          <span className="text-sm font-extrabold text-primary">{percent}%</span>
        </div>
        <Progress value={percent} className="h-3" />
        <p className="text-[11px] text-muted-foreground">
          {percent >= 100
            ? '🎉 অসাধারণ! আপনি আপনার বার্ষিক রিডিং লক্ষ্য সফলভাবে স্পর্শ করেছেন!'
            : `টার্গেট পূরণ করতে আর মাত্র ${Math.max(0, targetGoal - completedBooks.length)}টি বই বাকি রয়েছে। নিয়মিত বই পড়ুন!`}
        </p>
      </div>

      {/* Add Book to Shelf form */}
      <form onSubmit={handleAddBook} className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row gap-2.5">
        <Input
          placeholder="বইয়ের নাম লিখুন..."
          value={newBookTitle}
          onChange={(e) => setNewBookTitle(e.target.value)}
          className="h-9 text-xs flex-1"
        />
        <Input
          placeholder="লেখকের নাম (ঐচ্ছিক)"
          value={newBookAuthor}
          onChange={(e) => setNewBookAuthor(e.target.value)}
          className="h-9 text-xs sm:w-48"
        />
        <Button type="submit" size="sm" className="h-9 text-xs gap-1.5 shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span>শেলফে যোগ করুন</span>
        </Button>
      </form>

      {/* Shelf Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          সকল বই ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('reading')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'reading' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          বর্তমানে পড়ছি ({books.filter((b) => b.status === 'reading').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'completed' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          পড়া সম্পন্ন ({completedBooks.length})
        </button>
      </div>

      {/* Book List Shelf */}
      <div className="space-y-2">
        {filteredBooks.length === 0 ? (
          <p className="text-center py-6 text-xs text-muted-foreground">এই ক্যাটাগরিতে এখনো কোনো বই নেই।</p>
        ) : (
          filteredBooks.map((book) => (
            <div
              key={book.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-foreground">{book.title}</h4>
                <p className="text-[11px] text-muted-foreground">{book.author}</p>
                {book.completedAt && (
                  <span className="text-[10px] text-emerald-600 font-medium">সম্পন্ন: {book.completedAt}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {book.status === 'reading' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1"
                    onClick={() => handleMarkCompleted(book.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>পড়া শেষ</span>
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    সম্পন্ন
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
