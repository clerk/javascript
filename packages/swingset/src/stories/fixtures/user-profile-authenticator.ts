import type { UserProfileAuthenticatorCopyProps } from '@clerk/mosaic/features/user-profile/user-profile-authenticator-setup.view';
import { useEffect, useState } from 'react';

export const authenticatorSetup = {
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Swingset:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Swingset',
};

export function useAuthenticatorCopy() {
  const [copyState, setCopyState] = useState<UserProfileAuthenticatorCopyProps['state']>();

  useEffect(() => {
    if (copyState?.status !== 'success') {
      return;
    }
    const timeout = setTimeout(() => setCopyState(undefined), 2000);
    return () => clearTimeout(timeout);
  }, [copyState]);

  return {
    state: copyState,
    onCopy: async (value: string) => {
      if (copyState?.status === 'pending') {
        return;
      }
      setCopyState({ status: 'pending' });
      try {
        await navigator.clipboard.writeText(value);
        setCopyState({ status: 'success' });
      } catch {
        setCopyState({ status: 'error', message: 'Could not copy. Please try again.' });
      }
    },
  };
}
