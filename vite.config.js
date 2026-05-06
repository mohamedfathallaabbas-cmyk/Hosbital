import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// Frontend-only mode: base44 plugin removed to avoid hanging on external connections
export default defineConfig({
  root: './src',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});