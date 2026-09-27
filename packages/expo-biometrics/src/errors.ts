import type { BiometricsErrorCode } from './types';

const ERROR_CODES: ReadonlySet<string> = new Set<BiometricsErrorCode>([
  'user_canceled',
  'system_canceled',
  'user_fallback',
  'authentication_failed',
  'biometry_not_available',
  'biometry_not_enrolled',
  'biometry_lockout',
  'passcode_not_set',
  'key_not_found',
  'key_invalidated',
  'key_generation_failed',
  'signing_failed',
  'storage_failed',
  'invalid_argument',
  'not_implemented',
  'native_module_unavailable',
  'unknown',
]);

export class ClerkBiometricsError extends Error {
  readonly code: BiometricsErrorCode;

  constructor(code: BiometricsErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ClerkBiometricsError';
    this.code = code;
  }
}

export function isClerkBiometricsError(error: unknown): error is ClerkBiometricsError {
  return error instanceof ClerkBiometricsError;
}

export function isBiometricsErrorCode(value: unknown): value is BiometricsErrorCode {
  return typeof value === 'string' && ERROR_CODES.has(value);
}

export function toClerkBiometricsError(error: unknown): ClerkBiometricsError {
  if (error instanceof ClerkBiometricsError) {
    return error;
  }
  const code = (error as { code?: unknown } | null)?.code;
  const message = error instanceof Error ? error.message : String(error);
  return new ClerkBiometricsError(isBiometricsErrorCode(code) ? code : 'unknown', message, { cause: error });
}
