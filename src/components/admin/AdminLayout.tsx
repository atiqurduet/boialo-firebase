import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield, KeyRound, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { menuCategories } from '@/config/adminMenuConfig';
import { AdminSidebarHeader } from './sidebar/AdminSidebarHeader';
import { AdminSidebarSearch } from './sidebar/AdminSidebarSearch';
import { AdminSidebarNav } from './sidebar/AdminSidebarNav';
import { AdminSidebarUser } from './sidebar/AdminSidebarUser';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>(['ড্যাশবোর্ড']);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, role, loading, hasPermission } = useAdminAuth();
  const { user, signOut, signIn } = useAuth();

  // Find and auto-open current category
  useEffect(() => {
    const currentCategory = menuCategories.find(cat => 
      cat.items.some(item => location.pathname === item.href)
    );
    
    if (currentCategory && !openCategories.includes(currentCategory.label)) {
      setOpenCategories(prev => [...prev, currentCategory.label]);
    }
  }, [location.pathname]);

  const toggleCategory = (label: string) => {
    setOpenCategories(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  // Filter categories based on user role
  const filteredCategories = menuCategories.filter(cat => 
    hasPermission(cat.roles as any) && 
    cat.items.some(item => hasPermission(item.roles as any))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">এডমিন লগইন প্রয়োজন</h1>
            <p className="text-muted-foreground text-sm mt-1">
              বইআলো এডমিন ও ম্যানেজমেন্ট প্যানেল অ্যাক্সেস করতে অনুগ্রহ করে এডমিন হিসেবে লগইন করুন।
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              onClick={async () => {
                await signIn('help.boialo@gmail.com', 'admin123');
              }}
              className="w-full btn-primary py-5 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              সুপার এডমিন ১-ক্লিক লগইন (help.boialo@gmail.com)
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/signin?redirect=/admin')}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              অন্য এডমিন ক্রেডেনশিয়াল দিয়ে লগইন করুন
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="w-full text-muted-foreground text-xs"
            >
              হোমপেজে ফিরে যান
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">এডমিন পারমিশন প্রয়োজন</h1>
            <p className="text-muted-foreground text-sm mt-1">
              আপনি বর্তমানে <strong className="text-foreground">{user.email}</strong> হিসেবে লগইন আছেন, যার এডমিন পারমিশন নেই।
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              onClick={async () => {
                await signOut();
                await signIn('help.boialo@gmail.com', 'admin123');
              }}
              className="w-full btn-primary py-5 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              সুপার এডমিন অ্যাকাউন্টে সুইচ করুন (help.boialo@gmail.com)
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              হোমপেজে ফিরে যান
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-3 bg-card/95 backdrop-blur-sm border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-9 w-9"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">ব</span>
          </div>
          <span className="font-bold">এডমিন</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card border-r transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Header with collapse toggle */}
          <AdminSidebarHeader 
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />

          {/* Search (only when expanded) */}
          {!isCollapsed && (
            <AdminSidebarSearch 
              categories={filteredCategories}
              hasPermission={(roles) => hasPermission(roles as any)}
              onItemClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Navigation */}
          <AdminSidebarNav
            categories={filteredCategories}
            openCategories={openCategories}
            toggleCategory={toggleCategory}
            hasPermission={(roles) => hasPermission(roles as any)}
            onItemClick={() => setSidebarOpen(false)}
            isCollapsed={isCollapsed}
          />

          {/* User Info */}
          <AdminSidebarUser
            email={user.email || ''}
            role={role}
            onSignOut={handleSignOut}
            isCollapsed={isCollapsed}
          />
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:p-6 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
