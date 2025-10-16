import { createErrorTypeGuard } from './createErrorTypeGuard';

export interface ClerkErrorParams {
  /**
   * A message that describes the error. This is typically intented to be showed to the developers.
   * It should not be shown to the user or parsed directly as the message contents are not guaranteed
   * to be stable - use the `code` property instead.
   */
  message: string;
  /**
   * A machine-stable code that identifies the error.
   */
  code: string;
  /**
   * A user-friendly message that describes the error and can be displayed to the user.
   * This message defaults to English but can be usually translated to the user's language
   * by matching the `code` property to a localized message.
   */
  longMessage?: string;
  /**
   * The cause of the error, typically an `Error` instance that was caught and wrapped by the Clerk error handler.
   */
  cause?: Error;
  /**
   * A URL to the documentation for the error.
   */
  docsUrl?: string;
}

/**
 * A temporary placeholder, this will eventually be replaced with a
 * build-time flag that will actually perform DCE.
 */
const __DEV__ = true;

export class ClerkError extends Error {
  static kind = 'ClerkError';
  readonly clerkError = true as const;
  readonly code: string;
  readonly longMessage: string | undefined;
  readonly docsUrl: string | undefined;
  readonly cause: Error | undefined;

  get name() {
    return this.constructor.name;
  }

  constructor(opts: ClerkErrorParams) {
    super(new.target.formatMessage(new.target.kind, opts.message, opts.code, opts.docsUrl), { cause: opts.cause });
    Object.setPrototypeOf(this, ClerkError.prototype);
    this.code = opts.code;
    this.docsUrl = opts.docsUrl;
    this.longMessage = opts.longMessage;
    this.cause = opts.cause;
  }

  public toString() {
    return `[${this.name}]\nMessage:${this.message}`;
  }

  protected static formatMessage(name: string, msg: string, code: string, docsUrl: string | undefined) {
    // Keeping the Clerk prefix for backward compatibility
    // msg = `${name}: ${msg.trim()}\n\n(code="${code}")\n\n`;
    // We can remove the Clerk prefix in the next major version
    const prefix = 'Clerk:';
    const regex = new RegExp(prefix.replace(' ', '\\s*'), 'i');
    msg = msg.replace(regex, '');
    msg = `${prefix} ${msg.trim()}\n\n(code="${code}")\n\n`;
    if (__DEV__ && docsUrl) {
      msg += `\n\nDocs: ${docsUrl}`;
    }
    return msg;
  }
}

/**
 * Type guard to check if a value is a ClerkError instance.
 */
export function isClerkError(val: unknown): val is ClerkError {
  const typeguard = createErrorTypeGuard(ClerkError);
  // Ths is the base error so we're being more defensive about the type guard
  return typeguard(val) || (!!val && typeof val === 'object' && 'clerkError' in val && val.clerkError === true);
}
