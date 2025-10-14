export { errorToJSON, parseError, parseErrors } from './errors/parseError';

export { ClerkAPIResponseError } from './errors/clerkApiResponseError';

export { buildErrorThrower, type ErrorThrower, type ErrorThrowerOptions } from './errors/errorThrower';

export { EmailLinkError, EmailLinkErrorCode, EmailLinkErrorCodeStatus } from './errors/emailLinkError';

export type { MetamaskError } from './errors/metamaskError';

export { ClerkRuntimeError } from './errors/clerkRuntimeError';

export { ClerkWebAuthnError } from './errors/webAuthNError';

export {
  is4xxError,
  isCaptchaError,
  isClerkAPIResponseError,
  isClerkRuntimeError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isNetworkError,
  isPasswordPwnedError,
  isReverificationCancelledError,
  isUnauthorizedError,
  isUserLockedError,
} from './errors/helpers';
