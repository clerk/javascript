export * from './contexts';
export * from './components';
export * from './hooks';
export type {
  BrowserClerk,
  ClerkProp,
  HeadlessBrowserClerk,
  WithUserProp,
  WithClerkProp,
  WithSessionProp,
} from './types';
export { isMagicLinkError, MagicLinkErrorCode } from './errors';
export { useMagicLink } from './hooks/useMagicLink';

/**
 * Vite does not define `global` by default
 * One workaround is to use the `define` config prop
 * https://vitejs.dev/config/#define
 * We are solving this in the SDK level to reduce setup steps.
 */
if (typeof global === 'undefined' && typeof window !== 'undefined' && !window.global) {
  (window as any).global = window;
}
