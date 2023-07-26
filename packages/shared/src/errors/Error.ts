import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/types';

interface ClerkAPIResponseOptions {
  data: ClerkAPIErrorJSON[];
  status: number;
}

// For a comprehensive Metamask error list, please see
// https://docs.metamask.io/guide/ethereum-provider.html#errors
export interface MetamaskError extends Error {
  code: 4001 | 32602 | 32603;
  message: string;
  data?: unknown;
}

export function isKnownError(error: any) {
  return isClerkAPIResponseError(error) || isMetamaskError(error);
}

export function isClerkAPIResponseError(err: any): err is ClerkAPIResponseError {
  return 'clerkError' in err;
}

export function isMetamaskError(err: any): err is MetamaskError {
  return 'code' in err && [4001, 32602, 32603].includes(err.code) && 'message' in err;
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
      zxcvbn: error?.meta?.zxcvbn,
    },
  };
}

export class ClerkAPIResponseError extends Error {
  clerkError: true;

  status: number;
  message: string;

  errors: ClerkAPIError[];

  constructor(message: string, { data, status }: ClerkAPIResponseOptions) {
    super(message);

    Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);

    this.status = status;
    this.message = message;
    this.clerkError = true;
    this.errors = parseErrors(data);
  }

  public toString = () => {
    return `[${this.name}]\nMessage:${this.message}\nStatus:${this.status}\nSerialized errors: ${this.errors.map(e =>
      JSON.stringify(e),
    )}`;
  };
}

export class MagicLinkError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
    Object.setPrototypeOf(this, MagicLinkError.prototype);
  }
}
// Check if the error is a MagicLinkError.

export function isMagicLinkError(err: Error): err is MagicLinkError {
  return err instanceof MagicLinkError;
}

export const MagicLinkErrorCode = {
  Expired: 'expired',
  Failed: 'failed',
};
