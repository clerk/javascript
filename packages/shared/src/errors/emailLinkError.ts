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
 * @deprecated Use `EmailLinkErrorCodeStatus` instead.
 *
 * @internal
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
