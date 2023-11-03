import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  base: '/scrollerNumber/',
  server: {
    open: '/',
    // host: '127.0.0.1'
    // host: '10.205.96.245'
  },
  publicDir:'',
  plugins: [vue()],
})
