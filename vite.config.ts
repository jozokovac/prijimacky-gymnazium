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
      includeAssets: ['favicon.svg', 'CNAME', 'images/*.png', 'screenshots/*.png'],
      manifest: {
        id: '/?source=pwa',
        name: 'Mini Genius — prijímačky na 8-ročné gymnázium',
        short_name: 'Genius',
        description:
          'Tréning prijímačiek na 8-ročné gymnázium pre 5. ročník — slovenčina + matematika, gamifikácia, vauchere a živý odhad šance na prijatie. Pre Bratislavu.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fdf2f8',
        theme_color: '#ec4899',
        lang: 'sk',
        dir: 'ltr',
        categories: ['education', 'kids', 'productivity'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: '/screenshots/mobile-2-home.png',
            sizes: '444x720',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Domovská obrazovka — level, šanca na prijatie, ďalšia odmena',
          },
          {
            src: '/screenshots/mobile-1-onboarding.png',
            sizes: '444x720',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Onboarding — pomôžem ti dostať sa na 8-ročné gymnázium',
          },
          {
            src: '/screenshots/desktop-1-home.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Mini Genius akadémia — desktop',
          },
        ],
        shortcuts: [
          {
            name: 'Spustiť tréning',
            short_name: 'Tréning',
            description: 'Krátky 5-otázkový tréning',
            url: '/?action=quick-training',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Veľký test',
            short_name: 'Test',
            description: 'Dry-run prijímačiek (20 otázok, 30 min)',
            url: '/?action=big-test',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
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
