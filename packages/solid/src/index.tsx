export * from './contexts';
export type {
  BrowserClerk,
  ClerkProp,
  HeadlessBrowserClerk,
  WithUserProp,
  WithClerkProp,
  WithSessionProp,
} from './types';
export { isMagicLinkError, MagicLinkErrorCode } from '@clerk/utils';

/**
 * Vite does not define `global` by default
 * One workaround is to use the `define` config prop
 * https://vitejs.dev/config/#define
 * We are solving this in the SDK level to reduce setup steps.
 */
if (typeof global === 'undefined' && typeof window !== 'undefined' && !window.global) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).global = window;
}
