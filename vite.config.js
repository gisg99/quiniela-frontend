import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El frontend habla con el backend vía /api. En desarrollo se hace proxy
// al servidor Express (por defecto en el puerto 4000).
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
