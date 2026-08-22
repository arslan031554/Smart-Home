import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('react/') ||
            id.includes('react-dom/') ||
            id.includes('scheduler/') ||
            id.includes('react-router-dom/')
          ) {
            return 'react-vendor'
          }

          if (
            id.includes('@reduxjs/toolkit') ||
            id.includes('react-redux') ||
            id.includes('immer') ||
            id.includes('reselect')
          ) {
            return 'state-vendor'
          }

          if (
            id.includes('i18next') ||
            id.includes('react-i18next') ||
            id.includes('@formatjs')
          ) {
            return 'i18n-vendor'
          }

          if (id.includes('framer-motion')) {
            return 'motion-vendor'
          }

          if (id.includes('lucide-react')) {
            return 'icons-vendor'
          }

          if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
            return 'pdf-vendor'
          }

          if (id.includes('xlsx')) {
            return 'xlsx-vendor'
          }

          if (id.includes('axios')) {
            return 'network-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
})
