export const EXIT_CODE = {
  SUCCESS: 0,
  GENERAL: 1,
  USAGE: 2,
  SIGINT: 130,
} as const;

export type ExitCode = (typeof EXIT_CODE)[keyof typeof EXIT_CODE];

export type ErrorCode =
  | 'not_authenticated'
  | 'config'
  | 'storage'
  | 'token_exchange'
  | 'userinfo'
  | 'revoke'
  | 'timeout'
  | 'verify_api_key';

export interface ClerkCliAuthErrorOptions {
  exitCode?: ExitCode;
  cause?: unknown;
}

export class ClerkCliAuthError extends Error {
  code: ErrorCode | (string & {});
  exitCode: ExitCode;
  constructor(code: ErrorCode | (string & {}), message: string, options?: ClerkCliAuthErrorOptions) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'ClerkCliAuthError';
    this.code = code;
    this.exitCode = options?.exitCode ?? EXIT_CODE.GENERAL;
  }
}

export const isClerkCliAuthError = (error: unknown): error is ClerkCliAuthError => {
  return error instanceof ClerkCliAuthError;
};
