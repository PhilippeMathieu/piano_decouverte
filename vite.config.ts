/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/piano_decouverte/',
  plugins: [
    preact(),
    VitePWA({
      // Mise à jour appliquée sur l'accueil, jamais au milieu d'un exercice (src/core/app/pwa.ts).
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Piano découverte',
        short_name: 'Piano',
        description: 'Apprendre le piano pas à pas, à partir de 7 ans.',
        lang: 'fr',
        id: '/piano_decouverte/',
        start_url: '/piano_decouverte/',
        scope: '/piano_decouverte/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#cdeeff',
        theme_color: '#cdeeff',
        categories: ['music', 'education', 'kids'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,mp3}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      }
    })
  ],
  test: { include: ['src/**/*.test.ts'] }
});
