export {
  ClerkRuntimeError,
  ClerkAPIResponseError,
  EmailLinkError,
  EmailLinkErrorCode,
  isClerkAPIResponseError,
  isClerkRuntimeError,
  isEmailLinkError,
  isKnownError,
  isMagicLinkError,
  isMetamaskError,
  MagicLinkError,
  MagicLinkErrorCode,
  parseError,
  parseErrors,
} from '@clerk/shared/error';
export type { MetamaskError } from '@clerk/shared/error';
