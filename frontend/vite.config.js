import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Forces Vite to bind to 0.0.0.0 instead of localhost
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true // Ensures hot-reloading works seamlessly through the Docker volume
    }
  }
})