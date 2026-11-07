import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { handleMockSupabaseRequest } from './mockBackend';

const DEFAULT_OFFLINE_PROJECT = 'nyzvjuzrkhdbuqlcxhzn.supabase.co';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || `https://${DEFAULT_OFFLINE_PROJECT}`;
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55enZqdXpya2hkYnVxbGN4aHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MzU2ODIsImV4cCI6MjA4MjIxMTY4Mn0.TvKgRIDapujr-eAhEdMBVqVQ2o9AydFELCu3El7NCas';

let useOfflineMock = SUPABASE_URL.includes(DEFAULT_OFFLINE_PROJECT);

export const resilientSupabaseFetch: typeof fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (useOfflineMock || urlStr.includes(DEFAULT_OFFLINE_PROJECT)) {
    return handleMockSupabaseRequest(input, init);
  }

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