import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/types';

export function isUnauthorizedError(e: any): boolean {
  const status = e?.status;
  const code = e?.errors?.[0]?.code;
  return code === 'authentication_invalid' && status === 401;
}

export function isCaptchaError(e: ClerkAPIResponseError): boolean {
  return ['captcha_invalid', 'captcha_not_enabled', 'captcha_missing_token'].includes(e.errors[0].code);
}

export function is4xxError(e: any): boolean {
  const status = e?.status;
  return !!status && status >= 400 && status < 500;
}

export function isNetworkError(e: any): boolean {
  // TODO: revise during error handling epic
  const message = (`${e.message}${e.name}` || '').toLowerCase().replace(/\s+/g, '');
  return message.includes('networkerror');
}

interface ClerkAPIResponseOptions {
  data: ClerkAPIErrorJSON[];
  status: number;
  clerkTraceId?: string;
}

// For a comprehensive Metamask error list, please see
// https://docs.metamask.io/guide/ethereum-provider.html#errors
export interface MetamaskError extends Error {
  code: 4001 | 32602 | 32603;
  message: string;
  data?: unknown;
}

export function isKnownError(error: any): error is ClerkAPIResponseError | ClerkRuntimeError | MetamaskError {
  return isClerkAPIResponseError(error) || isMetamaskError(error) || isClerkRuntimeError(error);
}

export function isClerkAPIResponseError(err: any): err is ClerkAPIResponseError {
  return 'clerkError' in err;
}

// TODO: Find a better way to error when missing keys
export function isClerkKeyError(err: any) {
  const message = String(err);
  return (
    message.includes('Missing publishableKey') ||
    message.includes('Missing secretKey') ||
    message.includes("Clerk can't detect usage of clerkMiddleware()")
  );
}

/**
 * Checks if the provided error object is an instance of ClerkRuntimeError.
 *
 * @param {any} err - The error object to check.
 * @returns {boolean} True if the error is a ClerkRuntimeError, false otherwise.
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

export function isMetamaskError(err: any): err is MetamaskError {
  return 'code' in err && [4001, 32602, 32603].includes(err.code) && 'message' in err;
}

export function isUserLockedError(err: any) {
  return isClerkAPIResponseError(err) && err.errors?.[0]?.code === 'user_locked';
}

export function isPasswordPwnedError(err: any) {
  return isClerkAPIResponseError(err) && err.errors?.[0]?.code === 'form_password_pwned';
}

export function parseErrors(data: ClerkAPIErrorJSON[] = []): ClerkAPIError[] {
  return data.length > 0 ? data.map(parseError) : [];
}

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
    },
  };
}

export class ClerkAPIResponseError extends Error {
  clerkError: true;

  status: number;
  message: string;
  clerkTraceId?: string;

  errors: ClerkAPIError[];

  constructor(message: string, { data, status, clerkTraceId }: ClerkAPIResponseOptions) {
    super(message);

    Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);

    this.status = status;
    this.message = message;
    this.clerkTraceId = clerkTraceId;
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
 * @example
 *   throw new ClerkRuntimeError('An error occurred', { code: 'password_invalid' });
 */
export class ClerkRuntimeError extends Error {
  clerkRuntimeError: true;

  /**
   * The error message.
   *
   * @type {string}
   * @memberof ClerkRuntimeError
   */
  message: string;

  /**
   * A unique code identifying the error, can be used for localization.
   *
   * @type {string}
   * @memberof ClerkRuntimeError
   */
  code: string;

  constructor(message: string, { code }: { code: string }) {
    super(message);

    Object.setPrototypeOf(this, ClerkRuntimeError.prototype);

    this.code = code;
    this.message = message;
    this.clerkRuntimeError = true;
  }

  /**
   * Returns a string representation of the error.
   *
   * @returns {string} A formatted string with the error name and message.
   * @memberof ClerkRuntimeError
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
    Object.setPrototypeOf(this, EmailLinkError.prototype);
  }
}

export function isEmailLinkError(err: Error): err is EmailLinkError {
  return err instanceof EmailLinkError;
}

export const EmailLinkErrorCode = {
  Expired: 'expired',
  Failed: 'failed',
  ClientMismatch: 'client_mismatch',
};

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

export function buildErrorThrower({ packageName, customMessages }: ErrorThrowerOptions): ErrorThrower {
  let pkg = packageName;

  const messages = {
    ...DefaultMessages,
    ...customMessages,
  };

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
