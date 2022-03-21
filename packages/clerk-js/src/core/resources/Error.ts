import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/types';

interface ClerkAPIResponseOptions {
  data: ClerkAPIErrorJSON[];
  status: number;
}

export function isClerkAPIResponseError(object: any): object is ClerkAPIResponseError {
  return 'clerkError' in object;
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
