import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed to https://smartbooksbasha-svg.github.io/masjid-records-v2/
export default defineConfig({
  base: '/masjid-records-v2/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
          'vendor-qr': ['qrcode', 'jsqr'],
        },
      },
    },
  },
})
