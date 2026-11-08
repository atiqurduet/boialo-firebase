import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { handleMockSupabaseRequest } from './mockBackend';

const DEFAULT_OFFLINE_PROJECT = 'nyzvjuzrkhdbuqlcxhzn.supabase.co';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || `https://${DEFAULT_OFFLINE_PROJECT}`;
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55enZqdXpya2hkYnVxbGN4aHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MzU2ODIsImV4cCI6MjA4MjIxMTY4Mn0.TvKgRIDapujr-eAhEdMBVqVQ2o9AydFELCu3El7NCas';

// Optional cPanel MySQL PHP bridge URL (e.g. "https://boialo.com/uploads/api/db.php")
// Automatically defaults to "/uploads/api/db.php" when hosted on a custom cPanel domain.
const isCustomDomain =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !window.location.hostname.endsWith('.run.app');

export const MYSQL_API_URL: string =
  (import.meta as any).env?.VITE_MYSQL_API_URL || (isCustomDomain ? '/uploads/api/db.php' : '');

let useOfflineMock = SUPABASE_URL.includes(DEFAULT_OFFLINE_PROJECT) && !MYSQL_API_URL;

export const resilientSupabaseFetch: typeof fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  // 1. If cPanel MySQL API URL is configured, route PostgREST (/rest/v1/*) & Auth (/auth/v1/*) requests to MySQL on cPanel
  if (MYSQL_API_URL) {
    try {
      const parsedUrl = new URL(urlStr, 'https://mock.supabase.co');
      if (parsedUrl.pathname.startsWith('/rest/v1/') || parsedUrl.pathname.startsWith('/auth/v1/')) {
        const targetUrl = new URL(MYSQL_API_URL, window.location.origin);
        targetUrl.searchParams.set('_path', parsedUrl.pathname);
        parsedUrl.searchParams.forEach((val, key) => {
          targetUrl.searchParams.append(key, val);
        });
        const mysqlRes = await fetch(targetUrl.toString(), init);
        if (mysqlRes.ok || mysqlRes.status < 500) {
          return mysqlRes;
        }
      }
    } catch {
      // Fall through to local/Firestore adapter if cPanel MySQL endpoint is unreachable
    }
  }

  // 2. Firestore / local PostgREST adapter when default project is offline
  if (useOfflineMock || urlStr.includes(DEFAULT_OFFLINE_PROJECT)) {
    return handleMockSupabaseRequest(input, init);
  }

  // 3. Direct remote fetch with automatic fallback
  try {
    return await fetch(input, init);
  } catch {
    useOfflineMock = true;
    return handleMockSupabaseRequest(input, init);
  }
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: resilientSupabaseFetch,
  },
});