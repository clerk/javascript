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
   * A trace ID that can be used to identify the error in the Clerk API logs.
   */
  clerkTraceId?: string;
  kind?: string;
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
  readonly clerkError = true as const;
  readonly name: string = 'ClerkError';
  readonly code: string;
  readonly longMessage: string | undefined;
  readonly clerkTraceId: string | undefined;
  readonly kind: string;
  readonly docsUrl: string | undefined;
  readonly cause: Error | undefined;

  constructor(opts: ClerkErrorParams) {
    const formatMessage = (msg: string, code: string, docsUrl: string | undefined) => {
      msg = `${this.name}: ${msg.trim()}\n\n(code="${code}")\n\n`;
      if (__DEV__) {
        msg += `\n\nDocs: ${docsUrl}`;
      }
      return msg;
    };

    super(formatMessage(opts.message, opts.code, opts.docsUrl), { cause: opts.cause });
    Object.setPrototypeOf(this, ClerkError.prototype);

    this.code = opts.code;
    this.kind = opts.kind ?? 'ClerkError';
    this.docsUrl = opts.docsUrl;
  }
}

/**
 * Type guard to check if a value is a ClerkError instance.
 */
export function isClerkError(val: unknown): val is ClerkError {
  return !!val && typeof val === 'object' && 'clerkError' in val && val.clerkError === true;
}
