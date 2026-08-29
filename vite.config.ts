import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? 'https://inftzfvqtujcwmpwnvjl.supabase.co'
    ),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
      process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ??
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZnR6ZnZxdHVqY3dtcHdudmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3Mjk2OTIsImV4cCI6MjEwMzMwNTY5Mn0.VrIbE19lTCocLUD5JwlDej7sXbJvp-4fLD1GX1eppN8'
    ),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
