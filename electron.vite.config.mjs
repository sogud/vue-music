import {resolve} from 'node:path'
import {defineConfig, externalizeDepsPlugin} from 'electron-vite'
import vue from '@vitejs/plugin-vue'

const root = __dirname

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main'
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      outDir: 'out/preload'
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(root, 'src'),
        common: resolve(root, 'src/common'),
        components: resolve(root, 'src/components'),
        base: resolve(root, 'src/base'),
        api: resolve(root, 'src/api'),
        store: resolve(root, 'src/store'),
        router: resolve(root, 'src/router')
      }
    },
    plugins: [vue()]
  }
})
