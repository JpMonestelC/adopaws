import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Only used if VITE_API_URL is unset (see .env / src/services/api.js).
      // Kept in sync with the port Adopaws.Api listens on by default
      // (Adopaws.Api/Properties/launchSettings.json).
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
