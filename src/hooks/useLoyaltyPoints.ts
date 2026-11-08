import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface LoyaltySettings {
  points_per_taka: number;
  min_redeem_points: number;
  points_value_taka: number;
  signup_bonus: number;
  review_bonus: number;
  referral_bonus: number;
  referred_bonus: number;
  free_delivery_points: number;
  is_enabled: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  source: string;
  description: string;
  reference_id?: string | null;
  created_at: string;
}

export const useLoyaltyPoints = () => {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [settings, setSettings] = useState<LoyaltySettings>({
    points_per_taka: 0.02, // 1 point for every 50 Taka spent (2 points per 100 Tk)
    min_redeem_points: 20,
    points_value_taka: 1, // 1 point = 1 Taka direct conversion!
    signup_bonus: 50,
    review_bonus: 10,
    referral_bonus: 50, // 50 points to referrer
    referred_bonus: 50, // 50 points to friend
    free_delivery_points: 60, // 60 points for 100% Free Home Delivery
    is_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('loyalty_settings')
        .select('setting_key, setting_value');

      if (data && data.length > 0) {
        const parsed: Record<string, any> = {};
        data.forEach(item => {
          const val = (item.setting_value as any)?.value ?? item.setting_value;
          if (val !== undefined) parsed[item.setting_key] = val;
        });
        setSettings(prev => ({
          ...prev,
          ...parsed,
          points_value_taka: parsed.points_value_taka !== undefined ? Number(parsed.points_value_taka) : 1,
          free_delivery_points: parsed.free_delivery_points !== undefined ? Number(parsed.free_delivery_points) : 60,
          referral_bonus: parsed.referral_bonus !== undefined ? Number(parsed.referral_bonus) : 50,
          referred_bonus: parsed.referred_bonus !== undefined ? Number(parsed.referred_bonus) : 50,
        }));
      }
    } catch (e) {
      console.warn('Could not fetch loyalty settings, using defaults', e);
    }
  }, []);

  // Fetch user's points & transactions
  const fetchPointsAndLedger = useCallback(async () => {
    if (!user) {
      setTotalPoints(0);
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const total = data.reduce((sum, item) => {
          return item.type === 'redeemed' || item.type === 'expired'
            ? sum - Math.abs(item.points)
            : sum + item.points;
        }, 0);
        setTotalPoints(Math.max(0, total));
        setTransactions(data as LoyaltyTransaction[]);
      }

      // Fetch or generate referral code for this user
      const { data: codeData } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (codeData) {
        setReferralCode(codeData.code);
        setTotalReferrals(codeData.total_referrals || 0);
      } else {
        // Generate unique code based on user id or random string
        const generatedCode = 'BOI-' + (user.email ? user.email.slice(0, 3).toUpperCase() : 'REF') + Math.floor(1000 + Math.random() * 9000);
        await supabase.from('referral_codes').insert({
          user_id: user.id,
          code: generatedCode,
          total_referrals: 0,
          total_earned: 0,
          is_active: true,
        }).catch(() => {});
        setReferralCode(generatedCode);
      }
    } catch (e) {
      console.warn('Could not fetch loyalty points', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
    fetchPointsAndLedger();
  }, [fetchSettings, fetchPointsAndLedger]);

  // Add points
  const addPoints = async (points: number, source: string, description: string, referenceId?: string) => {
    if (!user || points <= 0) return;

    await supabase.from('loyalty_points').insert({
      user_id: user.id,
      points,
      type: 'earned',
      source,
      description,
      reference_id: referenceId || null,
      created_at: new Date().toISOString(),
    });

    await fetchPointsAndLedger();
  };

  // Redeem points for monetary discount
  const redeemPoints = async (points: number, orderId?: string) => {
    if (!user || points > totalPoints || points <= 0) return false;

    const { error } = await supabase.from('loyalty_points').insert({
      user_id: user.id,
      points: Math.abs(points),
      type: 'redeemed',
      source: 'checkout_discount',
      description: `${points} পয়েন্ট (${points * settings.points_value_taka} টাকা ছাড়) রিডিম করা হয়েছে`,
      reference_id: orderId || null,
      created_at: new Date().toISOString(),
    });

    if (error) return false;

    await fetchPointsAndLedger();
    return true;
  };

  // Redeem points for free delivery
  const redeemFreeDelivery = async (orderId?: string) => {
    const requiredPoints = settings.free_delivery_points || 60;
    if (!user || totalPoints < requiredPoints) {
      toast.error(`ফ্রি হোম ডেলিভারির জন্য ন্যূনতম ${requiredPoints} পয়েন্ট প্রয়োজন`);
      return false;
    }

    const { error } = await supabase.from('loyalty_points').insert({
      user_id: user.id,
      points: requiredPoints,
      type: 'redeemed',
      source: 'free_delivery',
      description: `ফ্রি হোম ডেলিভারি ভাউচার গ্রহণ (${requiredPoints} পয়েন্ট রিডিম)`,
      reference_id: orderId || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      toast.error('পয়েন্ট রিডিম করতে সমস্যা হয়েছে');
      return false;
    }

    await fetchPointsAndLedger();
    toast.success('🎉 ফ্রি হোম ডেলিভারি ভাউচার প্রয়োগ করা হয়েছে!');
    return true;
  };

  // Calculate points earned from order amount
  const calculateEarnedPoints = (orderSubtotal: number) => {
    if (!settings.is_enabled || orderSubtotal <= 0) return 0;
    // Default: 1 point per 50 Tk spent
    const rate = settings.points_per_taka > 0 ? settings.points_per_taka : 0.02;
    return Math.floor(orderSubtotal * rate);
  };

  // Process a friend's referral code
  const applyReferralCode = async (code: string) => {
    if (!user) {
      toast.error('রেফারাল কোড ব্যবহার করতে অনুগ্রহ করে লগইন করুন');
      return { success: false, message: 'লগইন আবশ্যক' };
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'রেফারাল কোড দিন' };
    }

    if (cleanCode === referralCode) {
      return { success: false, message: 'আপনি নিজের রেফারাল কোড ব্যবহার করতে পারবেন না' };
    }

    try {
      // Find the referral code owner
      const { data: refOwner, error: refErr } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (refErr || !refOwner) {
        return { success: false, message: 'রেফারাল কোডটি সঠিক নয় বা মেয়াদোত্তীর্ণ' };
      }

      // Check if this user was already referred
      const { data: existingReward } = await supabase
        .from('referral_rewards')
        .select('id')
        .eq('referred_id', user.id)
        .maybeSingle();

      if (existingReward) {
        return { success: false, message: 'আপনি ইতিমধ্যে একটি রেফারাল কোড ব্যবহার করেছেন' };
      }

      const rewardPoints = settings.referral_bonus || 50;

      // Reward the referred user (current user)
      await supabase.from('loyalty_points').insert({
        user_id: user.id,
        points: rewardPoints,
        type: 'earned',
        source: 'referral_bonus',
        description: `বন্ধুর রেফারাল কোড (${cleanCode}) ব্যবহারের জন্য স্বাগতম বোনাস`,
        created_at: new Date().toISOString(),
      });

      // Reward the referrer
      if (refOwner.user_id) {
        await supabase.from('loyalty_points').insert({
          user_id: refOwner.user_id,
          points: rewardPoints,
          type: 'earned',
          source: 'friend_referral',
          description: `বন্ধু আমন্ত্রণের জন্য রেফারাল বোনাস`,
          created_at: new Date().toISOString(),
        });

        // Update referrer's stats
        await supabase.from('referral_codes').update({
          total_referrals: (refOwner.total_referrals || 0) + 1,
          total_earned: (Number(refOwner.total_earned) || 0) + rewardPoints,
          updated_at: new Date().toISOString(),
        }).eq('id', refOwner.id);
      }

      // Record in referral_rewards
      await supabase.from('referral_rewards').insert({
        referral_code_id: refOwner.id,
        referrer_id: refOwner.user_id,
        referred_id: user.id,
        reward_amount: rewardPoints,
        status: 'completed',
        created_at: new Date().toISOString(),
      });

      await fetchPointsAndLedger();
      return { success: true, message: `অভিনন্দন! দুজনেই ${rewardPoints} পয়েন্ট পেয়েছেন!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'রেফারাল কোড প্রয়োগ করতে সমস্যা হয়েছে' };
    }
  };

  const getPointsValue = (points: number) => {
    return Math.round(points * (settings.points_value_taka || 1));
  };

  return {
    totalPoints,
    transactions,
    referralCode,
    totalReferrals,
    settings,
    loading,
    addPoints,
    redeemPoints,
    redeemFreeDelivery,
    calculateEarnedPoints,
    applyReferralCode,
    getPointsValue,
    refreshPoints: fetchPointsAndLedger,
  };
};
