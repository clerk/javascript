import { Clerk } from './core/clerk';

export {
  ClerkAPIResponseError,
  ClerkRuntimeError,
  EmailLinkError,
  EmailLinkErrorCode,
  EmailLinkErrorCodeStatus,
  isClerkAPIResponseError,
  isClerkRuntimeError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isUserLockedError,
  type MetamaskError,
} from '@clerk/shared/error';
export { Clerk };

if (module.hot) {
  module.hot.accept();
}
