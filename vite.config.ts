import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd())
  return defineConfig({
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, './src')
        }
      ]
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_APP_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  })
}
