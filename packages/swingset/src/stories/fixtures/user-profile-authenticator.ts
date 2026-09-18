import type { UserProfileAuthenticatorSetupViewProps } from '@clerk/mosaic/features/user-profile/user-profile-authenticator-setup.view';
import { useState } from 'react';

export const authenticatorSetup = {
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Swingset:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Swingset',
};

export function useAuthenticatorCopy() {
  const [copyStatus, setCopyStatus] = useState<UserProfileAuthenticatorSetupViewProps['copyStatus']>();
  const [copyErrorMessage, setCopyErrorMessage] = useState<string>();

  return {
    copyStatus,
    copyErrorMessage,
    onCopy: async (value: string) => {
      setCopyStatus('pending');
      setCopyErrorMessage(undefined);
      try {
        await navigator.clipboard.writeText(value);
        setCopyStatus('success');
      } catch {
        setCopyStatus(undefined);
        setCopyErrorMessage('Could not copy. Please try again.');
      }
    },
  };
}
