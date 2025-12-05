import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    // Exclude Clerk packages from pre-bundling to avoid esbuild issues with
    // nested wildcard exports like "@clerk/shared/internal/clerk-js/*"
    // These packages are already pre-built and don't need optimization
    exclude: ['@clerk/clerk-js', '@clerk/ui', '@clerk/shared'],
  },
});
