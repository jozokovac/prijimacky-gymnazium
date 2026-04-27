import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Hostované na vlastnej doméne genius.ayanza.com → base je root.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
