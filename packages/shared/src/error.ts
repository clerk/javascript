export { errorToJSON, parseError, parseErrors } from './errors/parseError';

export { ClerkAPIError, isClerkAPIError } from './errors/clerkApiError';
export { ClerkAPIResponseError, isClerkAPIResponseError } from './errors/clerkApiResponseError';
export { ClerkError, isClerkError } from './errors/clerkError';
export { MissingExpiredTokenError } from './errors/missingExpiredTokenError';

export { buildErrorThrower, type ErrorThrower, type ErrorThrowerOptions } from './errors/errorThrower';

export { EmailLinkError, EmailLinkErrorCode, EmailLinkErrorCodeStatus } from './errors/emailLinkError';

export type { MetamaskError } from './errors/metamaskError';

export { ClerkRuntimeError, isClerkRuntimeError } from './errors/clerkRuntimeError';

export { ClerkWebAuthnError } from './errors/webAuthNError';

export {
  is4xxError,
  isCaptchaError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isNetworkError,
  isPasswordPwnedError,
  isPasswordCompromisedError,
  isPasswordTooLongError,
  isReverificationCancelledError,
  isUnauthorizedError,
  isUserLockedError,
} from './errors/helpers';

export { createClerkGlobalHookError } from './errors/globalHookError';
