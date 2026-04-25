import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

const root = __dirname

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main'
    },
    resolve: {
      alias: {
        '@main': resolve(root, 'src/main'),
        '@shared': resolve(root, 'src/shared')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      outDir: 'out/preload'
    },
    resolve: {
      alias: {
        '@shared': resolve(root, 'src/shared')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(root, 'src/renderer'),
        '@shared': resolve(root, 'src/shared')
      }
    },
    plugins: [vue()]
  }
})
