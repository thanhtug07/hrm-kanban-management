import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'react-vendor', test: /[\\/]node_modules[\\/](react|react-dom|react-router)/ },
            { name: 'antd-vendor', test: /[\\/]node_modules[\\/](antd|@ant-design)/ },
            { name: 'chart-vendor', test: /[\\/]node_modules[\\/]recharts/ },
            { name: 'dnd-vendor', test: /[\\/]node_modules[\\/]@hello-pangea/ },
          ],
        },
      },
    },
  },
});