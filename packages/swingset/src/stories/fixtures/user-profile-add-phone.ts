import type { UserProfileAddPhoneViewProps } from '@clerk/ui/mosaic/user-profile/user-profile-add-phone.view';
import { useEffect, useState } from 'react';

type Step = UserProfileAddPhoneViewProps['step'];

interface FixtureOptions {
  failAt?: Step;
  onVerified?: (phoneNumber: string) => void;
}

export function useUserProfileAddPhoneFixture({ failAt, onVerified }: FixtureOptions = {}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('+18015558181');
  const [code, setCode] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (!open || resendSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => setResendSeconds(seconds => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(timer);
  }, [open, resendSeconds]);

  return {
    open,
    step,
    phoneNumber,
    code,
    isPending,
    isResending,
    errorMessage,
    resendSeconds,
    onOpenChange: (nextOpen: boolean) => {
      if (isPending || isResending) {
        return;
      }
      if (nextOpen) {
        setStep('phone');
        setCode('');
        setErrorMessage(undefined);
        setResendSeconds(0);
      }
      setOpen(nextOpen);
    },
    onPhoneNumberChange: (value: string) => {
      setPhoneNumber(value);
      setErrorMessage(undefined);
    },
    onCodeChange: (value: string) => {
      setCode(value);
      setErrorMessage(undefined);
    },
    onSubmit: async (submittedCode = code) => {
      if (isPending || isResending) {
        return;
      }
      setIsPending(true);
      setErrorMessage(undefined);
      await new Promise(resolve => setTimeout(resolve, 700));
      setIsPending(false);
      if (failAt === step || (step === 'verify' && submittedCode === '000000')) {
        setErrorMessage(
          step === 'phone' ? 'We couldn’t send a code. Try again.' : 'That code is incorrect. Try again.',
        );
        return;
      }
      if (step === 'phone') {
        setStep('verify');
        setResendSeconds(12);
      } else {
        onVerified?.(phoneNumber);
        setOpen(false);
      }
    },
    onResend: async () => {
      if (isPending || isResending || resendSeconds > 0) {
        return;
      }
      setIsResending(true);
      setErrorMessage(undefined);
      await new Promise(resolve => setTimeout(resolve, 700));
      setIsResending(false);
      setCode('');
      setResendSeconds(12);
    },
  };
}
