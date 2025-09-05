import type {
  ClerkAPIError,
  ClerkAPIErrorJSON,
  ClerkAPIResponseError as ClerkAPIResponseErrorInterface,
} from '@clerk/types';

/**
 * Checks if the provided error object is an unauthorized error.
 *
 * @internal
 *
 * @deprecated This is no longer used, and will be removed in the next major version.
 */
export function isUnauthorizedError(e: any): boolean {
  const status = e?.status;
  const code = e?.errors?.[0]?.code;
  return code === 'authentication_invalid' && status === 401;
}

/**
 * Checks if the provided error object is a captcha error.
 *
 * @internal
 */
export function isCaptchaError(e: ClerkAPIResponseError): boolean {
  return ['captcha_invalid', 'captcha_not_enabled', 'captcha_missing_token'].includes(e.errors[0].code);
}

/**
 * Checks if the provided error is a 4xx error.
 *
 * @internal
 */
export function is4xxError(e: any): boolean {
  const status = e?.status;
  return !!status && status >= 400 && status < 500;
}

/**
 * Checks if the provided error is a network error.
 *
 * @internal
 */
export function isNetworkError(e: any): boolean {
  // TODO: revise during error handling epic
  const message = (`${e.message}${e.name}` || '').toLowerCase().replace(/\s+/g, '');
  return message.includes('networkerror');
}

/**
 * Options for creating a ClerkAPIResponseError.
 *
 * @internal
 */
interface ClerkAPIResponseOptions {
  data: ClerkAPIErrorJSON[];
  status: number;
  clerkTraceId?: string;
  retryAfter?: number;
}

// For a comprehensive Metamask error list, please see
// https://docs.metamask.io/guide/ethereum-provider.html#errors
export interface MetamaskError extends Error {
  code: 4001 | 32602 | 32603;
  message: string;
  data?: unknown;
}

/**
 * Checks if the provided error is either a ClerkAPIResponseError, a ClerkRuntimeError, or a MetamaskError.
 *
 * @internal
 */
export function isKnownError(error: any): error is ClerkAPIResponseError | ClerkRuntimeError | MetamaskError {
  return isClerkAPIResponseError(error) || isMetamaskError(error) || isClerkRuntimeError(error);
}

/**
 * Checks if the provided error is a ClerkAPIResponseError.
 *
 * @internal
 */
export function isClerkAPIResponseError(err: any): err is ClerkAPIResponseError {
  return err && 'clerkError' in err;
}

/**
 * Checks if the provided error object is an instance of ClerkRuntimeError.
 *
 * @param err - The error object to check.
 * @returns True if the error is a ClerkRuntimeError, false otherwise.
 *
 * @example
 * const error = new ClerkRuntimeError('An error occurred');
 * if (isClerkRuntimeError(error)) {
 *   // Handle ClerkRuntimeError
 *   console.error('ClerkRuntimeError:', error.message);
 * } else {
 *   // Handle other errors
 *   console.error('Other error:', error.message);
 * }
 */
export function isClerkRuntimeError(err: any): err is ClerkRuntimeError {
  return 'clerkRuntimeError' in err;
}

/**
 * Checks if the provided error is a Clerk runtime error indicating a reverification was cancelled.
 *
 * @internal
 */
export function isReverificationCancelledError(err: any) {
  return isClerkRuntimeError(err) && err.code === 'reverification_cancelled';
}

/**
 * Checks if the provided error is a Metamask error.
 *
 * @internal
 */
export function isMetamaskError(err: any): err is MetamaskError {
  return 'code' in err && [4001, 32602, 32603].includes(err.code) && 'message' in err;
}

/**
 * Checks if the provided error is clerk api response error indicating a user is locked.
 *
 * @internal
 */
export function isUserLockedError(err: any) {
  return isClerkAPIResponseError(err) && err.errors?.[0]?.code === 'user_locked';
}

/**
 * Checks if the provided error is a clerk api response error indicating a password was pwned.
 *
 * @internal
 */
export function isPasswordPwnedError(err: any) {
  return isClerkAPIResponseError(err) && err.errors?.[0]?.code === 'form_password_pwned';
}

/**
 * Parses an array of ClerkAPIErrorJSON objects into an array of ClerkAPIError objects.
 *
 * @internal
 */
export function parseErrors(data: ClerkAPIErrorJSON[] = []): ClerkAPIError[] {
  return data.length > 0 ? data.map(parseError) : [];
}

/**
 * Parses a ClerkAPIErrorJSON object into a ClerkAPIError object.
 *
 * @internal
 */
export function parseError(error: ClerkAPIErrorJSON): ClerkAPIError {
  return {
    code: error.code,
    message: error.message,
    longMessage: error.long_message,
    meta: {
      paramName: error?.meta?.param_name,
      sessionId: error?.meta?.session_id,
      emailAddresses: error?.meta?.email_addresses,
      identifiers: error?.meta?.identifiers,
      zxcvbn: error?.meta?.zxcvbn,
      plan: error?.meta?.plan,
      isPlanUpgradePossible: error?.meta?.is_plan_upgrade_possible,
    },
  };
}

/**
 * Converts a ClerkAPIError object into a ClerkAPIErrorJSON object.
 *
 * @internal
 */
export function errorToJSON(error: ClerkAPIError | null): ClerkAPIErrorJSON {
  return {
    code: error?.code || '',
    message: error?.message || '',
    long_message: error?.longMessage,
    meta: {
      param_name: error?.meta?.paramName,
      session_id: error?.meta?.sessionId,
      email_addresses: error?.meta?.emailAddresses,
      identifiers: error?.meta?.identifiers,
      zxcvbn: error?.meta?.zxcvbn,
      plan: error?.meta?.plan,
      is_plan_upgrade_possible: error?.meta?.isPlanUpgradePossible,
    },
  };
}

export class ClerkAPIResponseError extends Error implements ClerkAPIResponseErrorInterface {
  clerkError: true;

  status: number;
  message: string;
  clerkTraceId?: string;
  retryAfter?: number;

  errors: ClerkAPIError[];

  constructor(message: string, { data, status, clerkTraceId, retryAfter }: ClerkAPIResponseOptions) {
    super(message);

    Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);

    this.status = status;
    this.message = message;
    this.clerkTraceId = clerkTraceId;
    this.retryAfter = retryAfter;
    this.clerkError = true;
    this.errors = parseErrors(data);
  }

  public toString = () => {
    let message = `[${this.name}]\nMessage:${this.message}\nStatus:${this.status}\nSerialized errors: ${this.errors.map(
      e => JSON.stringify(e),
    )}`;

    if (this.clerkTraceId) {
      message += `\nClerk Trace ID: ${this.clerkTraceId}`;
    }

    return message;
  };
}

/**
 * Custom error class for representing Clerk runtime errors.
 *
 * @class ClerkRuntimeError
 *
 * @example
 *   throw new ClerkRuntimeError('An error occurred', { code: 'password_invalid' });
 */
export class ClerkRuntimeError extends Error {
  clerkRuntimeError: true;

  /**
   * The error message.
   *
   * @type {string}
   */
  message: string;

  /**
   * A unique code identifying the error, can be used for localization.
   *
   * @type {string}
   */
  code: string;

  constructor(message: string, { code }: { code: string }) {
    const prefix = '🔒 Clerk:';
    const regex = new RegExp(prefix.replace(' ', '\\s*'), 'i');
    const sanitized = message.replace(regex, '');
    const _message = `${prefix} ${sanitized.trim()}\n\n(code="${code}")\n`;
    super(_message);

    Object.setPrototypeOf(this, ClerkRuntimeError.prototype);

    this.code = code;
    this.message = _message;
    this.clerkRuntimeError = true;
    this.name = 'ClerkRuntimeError';
  }

  /**
   * Returns a string representation of the error.
   *
   * @returns A formatted string with the error name and message.
   */
  public toString = () => {
    return `[${this.name}]\nMessage:${this.message}`;
  };
}

export class EmailLinkError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
    this.name = 'EmailLinkError' as const;
    Object.setPrototypeOf(this, EmailLinkError.prototype);
  }
}

/**
 * Checks if the provided error is an EmailLinkError.
 *
 * @internal
 */
export function isEmailLinkError(err: Error): err is EmailLinkError {
  return err.name === 'EmailLinkError';
}

/**
 * @deprecated Use `EmailLinkErrorCodeStatus` instead.
 *
 * @hidden
 */
export const EmailLinkErrorCode = {
  Expired: 'expired',
  Failed: 'failed',
  ClientMismatch: 'client_mismatch',
};

export const EmailLinkErrorCodeStatus = {
  Expired: 'expired',
  Failed: 'failed',
  ClientMismatch: 'client_mismatch',
} as const;

const DefaultMessages = Object.freeze({
  InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
  InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
  MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
  MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
  MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`,
});

type MessageKeys = keyof typeof DefaultMessages;

type Messages = Record<MessageKeys, string>;

type CustomMessages = Partial<Messages>;

export type ErrorThrowerOptions = {
  packageName: string;
  customMessages?: CustomMessages;
};

export interface ErrorThrower {
  setPackageName(options: ErrorThrowerOptions): ErrorThrower;

  setMessages(options: ErrorThrowerOptions): ErrorThrower;

  throwInvalidPublishableKeyError(params: { key?: string }): never;

  throwInvalidProxyUrl(params: { url?: string }): never;

  throwMissingPublishableKeyError(): never;

  throwMissingSecretKeyError(): never;

  throwMissingClerkProviderError(params: { source?: string }): never;

  throw(message: string): never;
}

/**
 * Builds an error thrower.
 *
 * @internal
 */
export function buildErrorThrower({ packageName, customMessages }: ErrorThrowerOptions): ErrorThrower {
  let pkg = packageName;

  /**
   * Builds a message from a raw message and replacements.
   *
   * @internal
   */
  function buildMessage(rawMessage: string, replacements?: Record<string, string | number>) {
    if (!replacements) {
      return `${pkg}: ${rawMessage}`;
    }

    let msg = rawMessage;
    const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);

    for (const match of matches) {
      const replacement = (replacements[match[1]] || '').toString();
      msg = msg.replace(`{{${match[1]}}}`, replacement);
    }

    return `${pkg}: ${msg}`;
  }

  const messages = {
    ...DefaultMessages,
    ...customMessages,
  };

  return {
    setPackageName({ packageName }: ErrorThrowerOptions): ErrorThrower {
      if (typeof packageName === 'string') {
        pkg = packageName;
      }
      return this;
    },

    setMessages({ customMessages }: ErrorThrowerOptions): ErrorThrower {
      Object.assign(messages, customMessages || {});
      return this;
    },

    throwInvalidPublishableKeyError(params: { key?: string }): never {
      throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
    },

    throwInvalidProxyUrl(params: { url?: string }): never {
      throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
    },

    throwMissingPublishableKeyError(): never {
      throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
    },

    throwMissingSecretKeyError(): never {
      throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
    },

    throwMissingClerkProviderError(params: { source?: string }): never {
      throw new Error(buildMessage(messages.MissingClerkProvider, params));
    },

    throw(message: string): never {
      throw new Error(buildMessage(message));
    },
  };
}

type ClerkWebAuthnErrorCode =
  // Generic
  | 'passkey_not_supported'
  | 'passkey_pa_not_supported'
  | 'passkey_invalid_rpID_or_domain'
  | 'passkey_already_exists'
  | 'passkey_operation_aborted'
  // Retrieval
  | 'passkey_retrieval_cancelled'
  | 'passkey_retrieval_failed'
  // Registration
  | 'passkey_registration_cancelled'
  | 'passkey_registration_failed';

export class ClerkWebAuthnError extends ClerkRuntimeError {
  /**
   * A unique code identifying the error, can be used for localization.
   */
  code: ClerkWebAuthnErrorCode;

  constructor(message: string, { code }: { code: ClerkWebAuthnErrorCode }) {
    super(message, { code });
    this.code = code;
  }
}
