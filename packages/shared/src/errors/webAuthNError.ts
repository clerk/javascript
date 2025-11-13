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

export class ClerkWebAuthnError extends ClerkRuntimeError {
  /**
   * A unique code identifying the error, can be used for localization.
   */
  code: ClerkWebAuthnErrorCode;

  constructor(message: string, { code }: { code: ClerkWebAuthnErrorCode }) {
    super(message, { code });
    this.code = code;
  }
}
