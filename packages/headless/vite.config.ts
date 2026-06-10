import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'primitives/accordion/index': 'src/primitives/accordion/index.ts',
        'primitives/dialog/index': 'src/primitives/dialog/index.ts',
        'utils/index': 'src/utils/index.ts',
        'hooks/index': 'src/hooks/index.ts',
        'hooks/use-controllable-state': 'src/hooks/use-controllable-state.ts',
        'hooks/use-transition': 'src/hooks/use-transition.ts',
        'hooks/use-transition-status': 'src/hooks/use-transition-status.ts',
        'hooks/use-animations-finished': 'src/hooks/use-animations-finished.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@floating-ui/react'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
  },
});
