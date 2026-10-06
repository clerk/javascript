import { useEffect, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail } from '@/lib/chaos';

export function useUserProfileVerifyEmailLinkFixture({ failResend = false } = {}) {
  const emailAddress = useChaosFixture('example@email.com', () => chaosEmail(0));
  const [open, setOpen] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(12);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!open) {
      return;
    }
    if (isResending) {
      const timer = setTimeout(() => {
        setIsResending(false);
        if (failResend) {
          setErrorMessage('Unable to send the verification link. Try again.');
        } else {
          setResendSeconds(12);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
    if (resendSeconds > 0) {
      const timer = setTimeout(() => setResendSeconds(seconds => seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [open, isResending, resendSeconds, failResend]);

  return {
    open,
    emailAddress,
    resendSeconds,
    isResending,
    errorMessage,
    onOpenChange: (value: boolean) => {
      setOpen(value);
      setResendSeconds(12);
      setIsResending(false);
      setErrorMessage(undefined);
    },
    onResend: () => {
      setErrorMessage(undefined);
      setIsResending(true);
    },
  };
}
