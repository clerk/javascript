/**
 * Vite does not define `global` by default
 * One workaround is to use the `define` config prop
 * https://vitejs.dev/config/#define
 * We are solving this in the SDK level to reduce setup steps.
 */
if (typeof global === 'undefined' && typeof window !== 'undefined' && !window.global) {
  console.log('nikos2?');
  (window as any).global = window;
}

export {};
