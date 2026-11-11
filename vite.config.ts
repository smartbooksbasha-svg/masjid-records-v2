import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed to https://smartbooksbasha-svg.github.io/masjid-records-v2/
export default defineConfig({
  base: '/masjid-records-v2/',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
})
