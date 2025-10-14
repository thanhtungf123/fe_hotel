import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Automatic JSX transform
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true }
    }
  }
})