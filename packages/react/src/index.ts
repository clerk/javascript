import './polyfills';

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
  IsomorphicClerkOptions,
} from './types';
export { MagicLinkErrorCode, isClerkAPIResponseError, isKnownError, isMetamaskError, isMagicLinkError } from './errors';
export { useMagicLink } from './hooks/useMagicLink';
