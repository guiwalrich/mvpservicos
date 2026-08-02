import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Usando import.meta.dirname conforme recomendado pelo Vite mais recente
      "@": path.resolve(import.meta.dirname || __dirname, "./src"),
    },
  },
  build: {
    // Aumenta o limite de aviso do chunk para 1000kb (1MB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'react-router-dom'],
        },
      },
    },
  },
})
