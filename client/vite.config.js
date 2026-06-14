import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },

  build: {
    // Raise the warning limit so only genuinely oversized chunks are flagged
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached aggressively by browsers
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Animation library — large but stable
          'vendor-motion': ['framer-motion'],

          // Icon library — tree-shaken per page but still sizeable
          'vendor-icons': ['lucide-react'],

          // HTTP + toast utilities
          'vendor-utils': ['axios', 'react-hot-toast', 'react-helmet-async'],
        },
      },
    },
  },
});
