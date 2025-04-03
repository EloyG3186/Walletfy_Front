import {resolve} from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': resolve(__dirname,'./src/components'),
      '@pages': resolve(__dirname,'./src/pages'),
      '@customTypes': resolve(__dirname, './src/types'),
      '@context': resolve(__dirname, './src/context'),
      '@models': resolve(__dirname, './src/models'),
      '@api': resolve(__dirname, './src/api'),
      '@utils': resolve(__dirname, './src/utils'),
      '@constants': resolve(__dirname, './src/constants'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@config': resolve(__dirname, './src/config'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react'],
          'react-dom': ['react-dom'],
          'event-balance': ['@components/EventBalance'],
        },
      },
    },
  },

  //base: 'https://EloyG3186.github.io/Walletfy_Project'
})
