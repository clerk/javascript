import './polyfills';

export * from './components';
export * from './contexts';
export {
  EmailLinkErrorCode,
  isClerkAPIResponseError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
} from './errors/messages';
export * from './hooks';
export { useEmailLink } from './hooks/useEmailLink';
export type {
  BrowserClerk,
  ClerkProp,
  HeadlessBrowserClerk,
  ClerkProviderOptionsWrapper,
  ClerkProviderProps,
  WithClerkProp,
  WithSessionProp,
  WithUserProp,
} from './types';

import { setErrorThrowerOptions } from './internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
