import './polyfills';

import { setErrorThrowerOptions } from './internal';

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
} from './types';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
