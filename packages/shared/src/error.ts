export { errorToJSON, parseError, parseErrors } from './errors/parseError';

export { ClerkAPIError } from './errors/clerkApiError';
export { ClerkAPIResponseError } from './errors/clerkApiResponseError';
export { ClerkError } from './errors/clerkError';

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

export { createClerkGlobalHookError } from './errors/globalHookError';
