export {
  ClerkRuntimeError,
  ClerkAPIResponseError,
  EmailLinkError,
  EmailLinkErrorCode,
  isClerkAPIResponseError,
  isClerkRuntimeError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isUserLockedError,
  parseError,
  parseErrors,
} from '@clerk/shared/error';
export type { MetamaskError } from '@clerk/shared/error';
