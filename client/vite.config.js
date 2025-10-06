import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Ye line '/api' requests ko port 5000 par bhej degi
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})