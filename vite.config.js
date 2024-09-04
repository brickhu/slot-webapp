import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(),tailwindcss()],
  base:"./",
  build: {
    cssMinify: "esbuild",
    rollupOptions:{
      plugins: [visualizer({ open: false })],
      output: {
        manualChunks: (id) => {
          if (id.includes('aoconnect')) {
            return 'aoconnect'
          }
          if (id.includes('@othent/kms')) {
            return '@othent/kms'
          }
          if (id.includes('bignumber.js')) {
            return 'bignumber.js'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      },
    }
  },
})


