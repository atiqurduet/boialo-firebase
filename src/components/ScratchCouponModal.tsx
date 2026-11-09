import React, { useState, useRef, useEffect } from 'react';
import { Gift, X, Sparkles, Copy, Check, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ScratchCouponModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  const { data: settings } = useQuery({
    queryKey: ['scratch-win-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['scratch_win_enabled', 'scratch_win_coupon_code']);
      const mapped: Record<string, any> = {};
      data?.forEach((d) => {
        mapped[d.setting_key] = d.setting_value;
      });
      return mapped;
    },
  });

  const isEnabled = settings?.scratch_win_enabled !== false && settings?.scratch_win_enabled !== 'false';
  const couponCode = settings?.scratch_win_coupon_code || 'BOIALOWIN';

  // Initialize Scratch Canvas
  useEffect(() => {
    if (!isOpen || isRevealed) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 280;
      canvas.height = 140;

      // Draw metallic scratch coat
      const gradient = ctx.createLinearGradient(0, 0, 280, 140);
      gradient.addColorStop(0, '#94a3b8');
      gradient.addColorStop(0.5, '#cbd5e1');
      gradient.addColorStop(1, '#64748b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 280, 140);

      // Add text on the scratch surface
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ এখানে ঘষে কুপন কোড দেখুন ✨', 140, 75);
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, isRevealed]);

  if (!isEnabled) return null;

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // Check how much is scratched
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentCount = 0;
      for (let i = 3; i < imgData.data.length; i += 16) {
        if (imgData.data[i] === 0) transparentCount++;
      }
      const totalPixels = imgData.data.length / 16;
      if (transparentCount / totalPixels > 0.45) {
        setIsRevealed(true);
      }
    } catch {
      // ignore
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success(`কুপন কোড '${couponCode}' কপি হয়েছে! চেকআউটে ব্যবহার করুন।`);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      {/* Floating launcher trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/40"
      >
        <Gift className="w-4 h-4 animate-bounce" />
        <span className="hidden sm:inline">সারপ্রাইজ কুপন ঘষুন</span>
        <span className="sm:hidden">কুপন</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-600 mb-1">
              <PartyPopper className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">লাকি স্ক্র্যাচ কার্ড!</h3>
              <p className="text-xs text-muted-foreground">কার্ডটি ঘষে আপনার গোপন ডিসকাউন্ট কোড উন্মোচন করুন</p>
            </div>

            {/* Scratch Box Area */}
            <div className="relative mx-auto w-[280px] h-[140px] rounded-xl overflow-hidden border-2 border-dashed border-amber-500/50 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40">
              {/* Underlying Secret Coupon */}
              <div className="text-center p-3 space-y-1">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  ১০% ফ্ল্যাট ডিসকাউন্ট
                </span>
                <div className="font-mono text-2xl font-black text-primary tracking-wider py-1 px-3 bg-white/80 dark:bg-black/60 rounded-lg shadow-inner">
                  {couponCode}
                </div>
                <p className="text-[10px] text-muted-foreground">পরবর্তী অর্ডারে তাৎক্ষণিক ব্যবহারযোগ্য</p>
              </div>

              {/* Scratchable Canvas Overlay */}
              {!isRevealed && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 cursor-pointer touch-none"
                  onMouseDown={() => (isDrawing.current = true)}
                  onMouseUp={() => (isDrawing.current = false)}
                  onMouseLeave={() => (isDrawing.current = false)}
                  onMouseMove={(e) => {
                    if (isDrawing.current) scratch(e.clientX, e.clientY);
                  }}
                  onTouchStart={() => (isDrawing.current = true)}
                  onTouchEnd={() => (isDrawing.current = false)}
                  onTouchMove={(e) => {
                    if (isDrawing.current && e.touches[0]) {
                      scratch(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                />
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleCopy}
                className="w-full gap-2 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'কপি হয়েছে!' : 'কুপন কোড কপি করুন'}</span>
              </Button>
              <button
                onClick={() => setIsRevealed(true)}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                ঘষতে সমস্যা হচ্ছে? সরাসরি দেখুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
