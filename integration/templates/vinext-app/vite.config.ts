import vinext from 'vinext';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: parseInt(process.env.PORT || '5173'),
  },
  plugins: [vinext()],
});
