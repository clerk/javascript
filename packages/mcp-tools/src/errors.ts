export type ClerkMcpErrorCode =
  | 'configuration'
  | 'insufficient_scope'
  | 'rejected'
  | 'forbidden'
  | 'rate_limited'
  | 'unavailable';

/**
 * Thrown for invalid configuration and for failed token exchanges. Branch on `code`, which is stable.
 */
export class ClerkMcpError extends Error {
  readonly code: ClerkMcpErrorCode;

  constructor(code: ClerkMcpErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'ClerkMcpError';
    this.code = code;
  }
}
