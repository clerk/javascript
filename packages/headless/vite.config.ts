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
        'primitives/tabs/index': 'src/primitives/tabs/index.ts',
        'primitives/tooltip/index': 'src/primitives/tooltip/index.ts',
        'primitives/popover/index': 'src/primitives/popover/index.ts',
        'primitives/select/index': 'src/primitives/select/index.ts',
        'primitives/menu/index': 'src/primitives/menu/index.ts',
        'primitives/autocomplete/index': 'src/primitives/autocomplete/index.ts',
        'primitives/collapsible/index': 'src/primitives/collapsible/index.ts',
        'primitives/dialog/index': 'src/primitives/dialog/index.ts',
        'utils/index': 'src/utils/index.ts',
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
