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
   * The error message in english, it contains a detailed description of the error.
   */
  message: string;

  /**
   * A unique code identifying the error, can be used for localization.
   */
  code: string;

  /**
   * The original error that was caught to throw an instance of ClerkRuntimeError.
   */
  cause?: Error;

  constructor(message: string, { code, cause }: { code: string; cause?: Error }) {
    const prefix = '🔒 Clerk:';
    const regex = new RegExp(prefix.replace(' ', '\\s*'), 'i');
    const sanitized = message.replace(regex, '');
    const _message = `${prefix} ${sanitized.trim()}\n\n(code="${code}")\n`;
    super(_message);

    Object.setPrototypeOf(this, ClerkRuntimeError.prototype);

    this.cause = cause;
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
