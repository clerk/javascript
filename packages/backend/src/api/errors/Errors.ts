import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/types';

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

  constructor(message: string, { data, status }: { data: any; status: number }) {
    super(message);

    Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);

    this.clerkError = true;
    this.message = message;
    this.status = status;
    this.errors = parseErrors(data);
  }
}
