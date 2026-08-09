import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const root = __dirname
const serverUrl = process.env.VITE_OTO_SERVER_URL ?? 'http://127.0.0.1:39273'
const port = Number(process.env.VITE_PORT ?? 39275)

export default defineConfig({
  root: resolve(root, 'src/renderer'),
  resolve: {
    alias: {
      '@': resolve(root, 'src/renderer/src'),
      '@renderer': resolve(root, 'src/renderer/src'),
      '@shared': resolve(root, 'src/shared')
    }
  },
  server: {
    host: '127.0.0.1',
    port,
    proxy: {
      '/api': serverUrl
    }
  },
  build: {
    outDir: resolve(root, 'out/web'),
    emptyOutDir: true
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('media-')
        }
      }
    })
  ]
})
