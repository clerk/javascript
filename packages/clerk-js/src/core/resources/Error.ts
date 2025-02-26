export {
  ClerkRuntimeError,
  ClerkAPIResponseError,
  EmailLinkError,
  EmailLinkErrorCode,
  EmailLinkErrorCodeStatus,
  isClerkAPIResponseError,
  isClerkRuntimeError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isUserLockedError,
} from '@clerk/shared/error';
export type { MetamaskError } from '@clerk/shared/error';
