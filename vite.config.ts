import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'CNAME', 'images/*.png'],
      manifest: {
        name: 'Mini Genius akadémia',
        short_name: 'Genius',
        description: 'Tréning prijímačiek na 8-ročné gymnázium',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fdf2f8',
        theme_color: '#ec4899',
        lang: 'sk',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/genius\.ayanza\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'app-cache' },
          },
        ],
      },
    }),
  ],
})
