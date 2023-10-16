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
export {
  MagicLinkErrorCode,
  EmailLinkErrorCode,
  isClerkAPIResponseError,
  isKnownError,
  isMetamaskError,
  isMagicLinkError,
  isEmailLinkError,
} from './errors';
export { useMagicLink } from './hooks/useMagicLink';
export { useEmailLink } from './hooks/useEmailLink';
