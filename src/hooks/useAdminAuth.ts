import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'super_admin' | 'admin' | 'manager' | 'support';

interface AdminAuthState {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: AppRole | null;
  loading: boolean;
  hasPermission: (requiredRole: AppRole | AppRole[]) => boolean;
}

export const useAdminAuth = (): AdminAuthState => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (authLoading) return;
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const userEmail = (user.email || '').toLowerCase().trim();

      // 1. Primary Owner & Super Admin email
      if (userEmail === 'help.boialo@gmail.com') {
        setRole('super_admin');
        setLoading(false);
        return;
      }

      // 2. Direct metadata role check
      const metaRole = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role;
      if (metaRole && ['super_admin', 'admin', 'manager', 'support'].includes(metaRole)) {
        setRole(metaRole as AppRole);
        setLoading(false);
        return;
      }

      try {
        // 3. RPC check
        const { data, error } = await (supabase as any).rpc('get_my_admin_role');

        if (!error && data && ['super_admin', 'admin', 'manager', 'support'].includes(data)) {
          setRole(data as AppRole);
          setLoading(false);
          return;
        }

        // 4. Fallback table query by email or user_id
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .or(`email.eq.${userEmail},user_id.eq.${user.id}`)
          .maybeSingle();

        if (roleRow?.role && ['super_admin', 'admin', 'manager', 'support'].includes(roleRow.role)) {
          setRole(roleRow.role as AppRole);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching admin role:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, authLoading]);

  const hasPermission = useCallback((requiredRole: AppRole | AppRole[]): boolean => {
    if (!role) return false;
    
    const roleHierarchy: Record<AppRole, number> = {
      super_admin: 4,
      admin: 3,
      manager: 2,
      support: 1
    };

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userLevel = roleHierarchy[role] ?? 0;
    
    // Only super admin has all permissions automatically
    if (role === 'super_admin') return true;
    
    // Check if user's role level is >= any of the required roles
    return roles.some(r => userLevel >= (roleHierarchy[r] ?? 0));
  }, [role]);

  return {
    isAdmin: role !== null,
    isSuperAdmin: role === 'super_admin',
    role,
    loading: loading || authLoading,
    hasPermission
  };
};
