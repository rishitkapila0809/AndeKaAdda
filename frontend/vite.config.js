import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
  registerType: 'autoUpdate',

  includeAssets: [
    'icon.png',
    'logo.png'
  ],

  manifest: {
    name: 'AndeKaAdda',

    short_name: 'AndeKaAdda',

    description:
      'Eggzactly What You Need',

    theme_color: '#f59e0b',

    background_color: '#111827',

    display: 'standalone',

    orientation: 'portrait',

    scope: '/',

    start_url: '/',

    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png'
      },

      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
})
  ]
})