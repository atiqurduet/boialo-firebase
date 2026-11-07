import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

process.env.CI = "true";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL || "https://nyzvjuzrkhdbuqlcxhzn.supabase.co"
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55enZqdXpya2hkYnVxbGN4aHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MzU2ODIsImV4cCI6MjA4MjIxMTY4Mn0.TvKgRIDapujr-eAhEdMBVqVQ2o9AydFELCu3El7NCas"
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_SUPABASE_PROJECT_ID || "nyzvjuzrkhdbuqlcxhzn"
    ),
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 1200,
    // NOTE: Custom manualChunks previously split React/Radix/etc into separate
    // chunks. That caused a circular-import TDZ crash in production
    // ("Cannot access 'P' before initialization") because Radix/Tanstack chunks
    // load before the React chunk finishes initializing. Let Rollup handle
    // chunking automatically — safer and still tree-shakes well.
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
