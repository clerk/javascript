import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Assuming React is used, based on dependencies
import svgr from 'vite-plugin-svgr'; // For SVG handling

// https://vitest.dev/config/
export default defineConfig({
  // Provide global variables like __PKG_NAME__ and __PKG_VERSION__
  // Replaces jest.globals
  define: {
    __PKG_NAME__: '\"@clerk/clerk-js\"',
    __PKG_VERSION__: '\"test\"', // Or derive dynamically if needed
  },
  plugins: [
    // @ts-expect-error - svgr types might be slightly off depending on versions
    svgr(),
    // Use the React plugin for JSX/TSX transformation
    // This replaces ts-jest/swc
    react({
      // Use babel for @emotion support if needed, otherwise remove this
      // babel: {
      //   plugins: ['@emotion/babel-plugin'],
      // },
    }),
  ],
  test: {
    name: 'clerk-js', // Display name, replaces jest.displayName
    globals: true, // Replaces jest.injectGlobals / @jest/globals
    environment: 'jsdom', // Replaces jest.testEnvironment
    setupFiles: './vitest.setup.ts', // Replaces jest.setupFiles / setupFilesAfterEnv

    // Replicate test file patterns
    // Replaces jest.testRegex
    include: [
      'src/**/__tests__/**/*.test.{ts,tsx}',
      'src/ui/**/__tests__/**/*.test.{ts,tsx}',
      'src/**/(core|utils)/**/*.test.{ts,tsx}',
    ],

    // Handle node_module transforms
    // Replaces jest.transformIgnorePatterns
    deps: {
      inline: [
        '@formkit/auto-animate', // Ensure this is transformed
      ],
    },

    // Coverage configuration
    // Replaces jest.collectCoverage, coverageProvider, etc.
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/**/index.browser.ts',
        'src/**/index.headless.ts',
        'src/**/index.headless.browser.ts',
        'src/**/coverage/**',
        'src/**/dist/**',
        'src/**/node_modules/**',
        'src/(ui|utils|core)/__tests__/**', // Exclude test files themselves
      ],
    },

    // Optional: Point to a specific tsconfig if needed
    // tsconfig: 'tsconfig.test.json'
  },
  // Optional: Replicate module resolution if needed
  resolve: {
    // Add alias for SVG imports to point to the mock
    alias: {
      '.svg$': './src/__tests__/mocks/svgMock.tsx', // Use regex to match any path ending in .svg
    },
    // modules: ['node_modules', 'src'], // Replaces jest.moduleDirectories (Uncomment if needed)
  },
});
