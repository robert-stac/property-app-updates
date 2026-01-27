import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // 'autoUpdate' is also an option, but 'prompt' is better for your users
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // THIS IS THE KEY FOR OFFLINE:
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst', // Tries network, but falls back to cache immediately if offline
          },
          {
            urlPattern: ({ request }) => 
              request.destination === 'script' || 
              request.destination === 'style' || 
              request.destination === 'image',
            handler: 'StaleWhileRevalidate', // Serves from cache instantly, updates in background
          },
        ],
      },
      manifest: {
        name: 'Buwembo Property Management',
        short_name: 'BuwemboApp',
        theme_color: '#1d4ed8',
        background_color: '#ffffff',
        display: 'standalone', // Makes it look like a real app
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});