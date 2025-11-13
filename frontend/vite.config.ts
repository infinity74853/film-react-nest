import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['src/scss']
      }
    }
  },
  server: {
    host: '0.0.0.0',  // ← РАЗРЕШАЕМ ВСЕМ ПОДКЛЮЧАТЬСЯ
    port: 5173,
    strictPort: true,  // ← НЕ МЕНЯТЬ ПОРТ АВТОМАТИЧЕСКИ
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/content': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
      }
    }
  }
})
