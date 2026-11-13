import { useClerk } from '@clerk/shared/react';
import { isWebAuthnSupported } from '@clerk/shared/webauthn';

/**
 * Whether this environment can complete a passkey ceremony. SDKs such as
 * Electron override the browser check via `__internal_isWebAuthnSupported`,
 * because `PublicKeyCredential` can exist even where passkeys won't work.
 */
export const useIsWebAuthnSupported = (): boolean => {
  // @ts-expect-error - This is not a public API
  const { __internal_isWebAuthnSupported } = useClerk();
  return (__internal_isWebAuthnSupported ?? isWebAuthnSupported)();
};
