import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        // `name` shows on the install prompt + splash; `short_name` is
        // what appears under the icon on the homescreen — keep the brand,
        // not the audience label.
        name: 'Mimuads for Hosts',
        short_name: 'Mimuads',
        description: 'Track your Mimuads screen earnings, check status, and get paid.',
        theme_color: '#B55430',
        background_color: '#F7F5F2',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          // Standard ("any") for splash, install dialog, and as fallback
          // on platforms that don't support maskable icons.
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          // Maskable for Android's adaptive-icon system. We declare the
          // 512 maskable at both 192 and 512 entries so smaller-density
          // devices don't scale a 512 down badly.
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        // Tell the new SW to take over open tabs immediately and clean up
        // old precache entries, so a deploy doesn't pin stale icons or
        // manifest behind an outdated SW until every tab closes.
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
