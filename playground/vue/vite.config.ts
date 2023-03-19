import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // this is needed because clerk-react is a CommonJS module and clerk-vue uses
  optimizeDeps: {
    include: ['@clerk/clerk-vue']
  }
})
