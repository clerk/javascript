import { ClerkWebAuthnError } from '@clerk/shared/error';

import type { PasskeyNativeErrorCode } from '../../shared/types';

const RP_ID_DOCS_URL = 'https://clerk.com/docs/deployments/overview#authentication-across-subdomains';

/** Maps native bridge errors to clerk-js WebAuthn errors. */
export function mapPasskeyIpcError(
  error: { code: PasskeyNativeErrorCode; message: string },
  action: 'create' | 'get',
): ClerkWebAuthnError {
  const { code, message } = error;

  switch (code) {
    case 'cancelled':
      return new ClerkWebAuthnError(message, {
        code: action === 'create' ? 'passkey_registration_cancelled' : 'passkey_retrieval_cancelled',
      });
    case 'invalid_rp':
      return new ClerkWebAuthnError(message, {
        code: 'passkey_invalid_rpID_or_domain',
        docsUrl: RP_ID_DOCS_URL,
      });
    case 'timeout':
      return new ClerkWebAuthnError(message, { code: 'passkey_operation_aborted' });
    case 'not_supported':
      return new ClerkWebAuthnError(message, { code: 'passkey_not_supported' });
    case 'unknown':
    default:
      return new ClerkWebAuthnError(message, {
        code: action === 'create' ? 'passkey_registration_failed' : 'passkey_retrieval_failed',
      });
  }
}
