import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      'paparse': path.resolve(__dirname, 'node_modules/papaparse/papaparse.min.js')
    }
  }
})
