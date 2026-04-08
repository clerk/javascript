import type { ClerkErrorParams } from './clerkError';
import { ClerkRuntimeError } from './clerkRuntimeError';

type ClerkWebAuthnErrorCode =
  // Generic
  | 'passkey_not_supported'
  | 'passkey_pa_not_supported'
  | 'passkey_invalid_rpID_or_domain'
  | 'passkey_already_exists'
  | 'passkey_operation_aborted'
  // Retrieval
  | 'passkey_retrieval_cancelled'
  | 'passkey_retrieval_failed'
  // Registration
  | 'passkey_registration_cancelled'
  | 'passkey_registration_failed';

type ClerkWebAuthnErrorOptions = Omit<ClerkErrorParams, 'message' | 'code'> & { code: ClerkWebAuthnErrorCode };

export class ClerkWebAuthnError extends ClerkRuntimeError {
  /**
   * A unique code identifying the error, can be used for localization.
   */
  code: ClerkWebAuthnErrorCode;

  constructor(message: string, options: ClerkWebAuthnErrorOptions) {
    super(message, options);
    this.code = options.code;
  }
}
