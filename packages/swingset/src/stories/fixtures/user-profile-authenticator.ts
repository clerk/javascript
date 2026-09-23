import type { UserProfileAuthenticatorCopyProps } from '@clerk/mosaic/features/user-profile/user-profile-authenticator-setup.view';
import { useState } from 'react';

export const authenticatorSetup = {
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Swingset:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Swingset',
};

export function useAuthenticatorCopy() {
  const [copyState, setCopyState] = useState<UserProfileAuthenticatorCopyProps['state']>();

  return {
    state: copyState,
    onCopy: async (value: string) => {
      if (copyState?.status === 'pending') {
        return;
      }
      setCopyState({ status: 'pending' });
      try {
        await navigator.clipboard.writeText(value);
        setCopyState(undefined);
      } catch (error) {
        setCopyState({ status: 'error', message: 'Could not copy. Please try again.' });
        throw error;
      }
    },
  };
}
