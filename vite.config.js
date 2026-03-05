import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/endy/',

  server: {
    port: 5177,
  },

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],

      manifest: {
        name: 'אנדי - משחק שרשרת מילים',
        short_name: 'אנדי',
        description: 'משחק שרשרת מילים עברית מרובה שחקנים בזמן אמת',
        theme_color: '#1a0533',
        background_color: '#0f0020',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'he',
        dir: 'rtl',
        start_url: '/endy/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },

      workbox: {
        skipWaiting: true,       // new SW activates immediately without waiting for tabs to close
        clientsClaim: true,      // new SW takes control of all open pages right away
        globPatterns: ['**/*.{js,css,html,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 },
            },
          },
        ],
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
