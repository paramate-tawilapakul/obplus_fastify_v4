import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [
  //   react({
  //     jsxImportSource: '@emotion/react',
  //     babel: {
  //       plugins: ['@emotion/babel-plugin'],
  //     },
  //   }),
  // ],
  plugins: [react()],
  build: {
    // outDir: '../build/dist/client',
    outDir: 'C:/codespace/obplus/build/1.obplus_fastify/dist/client',
    emptyOutDir: true,
    minify: true,
    sourcemap: true,
    chunkSizeWarningLimit: 20000,
  },
  optimizeDeps: {
    include: [
      // '@emotion/react',
      // '@emotion/styled',
      // '@mui/material/Tooltip',
    ],
  },

  server: {
    port: 3004,
    proxy: {
      '/api': {
        target: 'http://localhost:6500',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
