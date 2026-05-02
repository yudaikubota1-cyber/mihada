import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rakuten-api': {
        target: 'https://app.rakuten.co.jp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rakuten-api/, ''),
      },
    },
  },
})
