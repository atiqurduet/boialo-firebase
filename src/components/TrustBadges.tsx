import React from 'react';
import { ShieldCheck, RotateCcw, Truck, Award, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrustBadgeItem {
  title: string;
  subtitle: string;
}

interface TrustBadgesProps {
  className?: string;
  variant?: 'compact' | 'full';
  settings?: {
    badges?: TrustBadgeItem[];
  };
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ className = '', variant = 'full', settings: sectionSettings }) => {
  const { data: settings } = useQuery({
    queryKey: ['trust-badge-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['trust_courier_open_enabled', 'trust_badge_text']);
      const mapped: Record<string, any> = {};
      data?.forEach((d) => {
        mapped[d.setting_key] = d.setting_value;
      });
      return mapped;
    },
  });

  const isEnabled = settings?.trust_courier_open_enabled !== false && settings?.trust_courier_open_enabled !== 'false';
  const customBadgeText = settings?.trust_badge_text || 'ডেলিভারি ম্যানের সামনে পার্সেল খুলে দেখে নেওয়ার সুযোগ';

  if (!isEnabled) return null;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-medium ${className}`}>
        <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{customBadgeText}</span>
      </div>
    );
  }

  const defaultBadges: TrustBadgeItem[] = [
    { title: 'পার্সেল ওপেন গ্যারান্টি', subtitle: customBadgeText },
    { title: '৭ দিনের রিটার্ন', subtitle: 'ত্রুটিযুক্ত বইয়ে ফ্রি এক্সচেঞ্জ' },
    { title: '১০০% আসল বই', subtitle: 'সরাসরি মূল প্রকাশনী থেকে' },
    { title: 'ক্যাশ অন ডেলিভারি', subtitle: 'বই হাতে পেয়ে মূল্য পরিশোধ' },
  ];

  const badges = Array.isArray(sectionSettings?.badges) && sectionSettings!.badges.filter(b => b?.title).length > 0
    ? sectionSettings!.badges.filter(b => b?.title)
    : defaultBadges;

  const icons = [
    { Icon: Eye, style: 'bg-emerald-500/10 text-emerald-600' },
    { Icon: RotateCcw, style: 'bg-blue-500/10 text-blue-600' },
    { Icon: Award, style: 'bg-amber-500/10 text-amber-600' },
    { Icon: Truck, style: 'bg-purple-500/10 text-purple-600' },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-card border border-border shadow-xs ${className}`}>
      {badges.map((badge, idx) => {
        const { Icon, style } = icons[idx % icons.length];
        return (
          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
            <div className={`p-2 rounded-lg shrink-0 ${style}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">{badge.title}</h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{badge.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
