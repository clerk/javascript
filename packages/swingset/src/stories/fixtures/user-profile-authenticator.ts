import type { UserProfileAddAuthenticatorDialogProps } from '@clerk/mosaic/features/user-profile/user-profile-add-authenticator.dialog';
import { useEffect, useRef, useState } from 'react';

export const authenticatorSetup = {
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Swingset:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Swingset',
};

export function useAuthenticatorCopy() {
  const [copyStatus, setCopyStatus] = useState<UserProfileAddAuthenticatorDialogProps['copyStatus']>();
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

export function useUserProfileAuthenticatorPreparationFixture({
  initialOpen = false,
} = {}): UserProfileAddAuthenticatorDialogProps {
  const [open, setOpen] = useState(initialOpen);
  const [preparation, setPreparation] = useState<'loading' | 'error' | 'ready'>(initialOpen ? 'error' : 'loading');
  const [code, setCode] = useState('');
  const preparationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copy = useAuthenticatorCopy();

  useEffect(() => () => clearTimeout(preparationTimer.current), []);

  const prepare = (result: 'error' | 'ready') => {
    clearTimeout(preparationTimer.current);
    setPreparation('loading');
    preparationTimer.current = setTimeout(() => setPreparation(result), 1000);
  };

  return {
    ...copy,
    open,
    onOpenChange: nextOpen => {
      setOpen(nextOpen);
      if (nextOpen) {
        setCode('');
        prepare('error');
      } else {
        clearTimeout(preparationTimer.current);
      }
    },
    setup: preparation === 'ready' ? authenticatorSetup : undefined,
    setupErrorMessage: preparation === 'error' ? 'Unable to prepare your authenticator. Please try again.' : undefined,
    onRetry: () => prepare('ready'),
    code,
    onCodeChange: setCode,
    onSubmit: () => setOpen(false),
  };
}
