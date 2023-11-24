import './polyfills';

import { Experimental__Gate } from './components';
import { useAuth } from './hooks';

export * from './components';
export * from './contexts';
export { EmailLinkErrorCode, isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from './errors';
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

export function createClerk<Role extends string = string, Permission extends string = string>() {
  return {
    Gate: Experimental__Gate<Role, Permission>,
    useAuth: useAuth<Role, Permission>,
  };
}
