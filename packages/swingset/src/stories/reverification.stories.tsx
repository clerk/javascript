import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import type { ReverificationMethod, ReverificationStep } from '@clerk/ui/mosaic/features/reverification';
import { ReverificationView } from '@clerk/ui/mosaic/features/reverification/reverification.view';
import { ReverificationBackupCode } from '@clerk/ui/mosaic/features/reverification/reverification-backup-code';
import { ReverificationHelp } from '@clerk/ui/mosaic/features/reverification/reverification-help';
import { ReverificationMethodPicker } from '@clerk/ui/mosaic/features/reverification/reverification-method-picker';
import { ReverificationOTP } from '@clerk/ui/mosaic/features/reverification/reverification-otp';
import { ReverificationPasskey } from '@clerk/ui/mosaic/features/reverification/reverification-passkey';
import { ReverificationPassword } from '@clerk/ui/mosaic/features/reverification/reverification-password';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './reverification.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'Reverification',
  source: 'packages/ui/src/mosaic/features/reverification/reverification.view.tsx',
};

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const methodPickerMessages = {
  title: 'Use another method',
  description: 'Facing issues? You can use any of these methods for verification.',
  backButton: 'Back',
  helpText: 'Don’t have any of these?',
  helpButton: 'Get help',
};

const helpMessages = {
  title: 'Get help',
  description:
    'If you have trouble verifying your account, email us and we will work with you to restore access as soon as possible.',
  backButton: 'Back',
  supportButton: 'Email support',
};

const allMethods: ReverificationMethod[] = [
  { id: 'password', strategy: 'password' },
  { id: 'passkey', strategy: 'passkey' },
  { id: 'totp', strategy: 'totp' },
  { id: 'backup_code', strategy: 'backup_code' },
];

function stepFor(id: string): ReverificationStep {
  if (id === 'passkey') {
    return 'passkey';
  }
  if (id === 'backup_code') {
    return 'backup-code';
  }
  if (id === 'totp') {
    return 'otp';
  }
  return 'password';
}

function WorkingExample({ onComplete }: { onComplete: () => void }): JSX.Element {
  const [step, setStep] = useState<ReverificationStep>('password');
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [methodId, setMethodId] = useState('password');
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [supportRequested, setSupportRequested] = useState(false);

  const navigate = (next: ReverificationStep, nextDirection: -1 | 1) => {
    setDirection(nextDirection);
    setStep(next);
    setValue('');
    setErrorMessage(undefined);
  };

  const onValueChange = (nextValue: string) => {
    setValue(nextValue);
    setErrorMessage(undefined);
  };

  const submitPassword = async () => {
    if (!value.trim()) {
      setErrorMessage('This field is required.');
      return;
    }
    setIsPending(true);
    await settleAfter(700);
    setIsPending(false);
    if (value.toLowerCase() === 'error') {
      setErrorMessage('That password is incorrect. Try again.');
      return;
    }
    setMethodId('totp');
    navigate('otp', 1);
  };

  const submitOtp = async (code: string) => {
    if (code.length !== 6) {
      setErrorMessage('Enter the complete verification code.');
      return;
    }
    setIsPending(true);
    await settleAfter(700);
    setIsPending(false);
    if (code === '000000') {
      setErrorMessage('That verification code is incorrect. Try again.');
      return;
    }
    onComplete();
  };

  const submitBackupCode = async () => {
    if (!value.trim()) {
      setErrorMessage('This field is required.');
      return;
    }
    setIsPending(true);
    await settleAfter(700);
    setIsPending(false);
    if (value.toLowerCase() === 'error') {
      setErrorMessage('That backup code is incorrect. Try again.');
      return;
    }
    onComplete();
  };

  const submitPasskey = async () => {
    setIsPending(true);
    await settleAfter(700);
    setIsPending(false);
    onComplete();
  };

  const selectMethod = async (id: string) => {
    setIsPending(true);
    await settleAfter(700);
    setIsPending(false);
    setMethodId(id);
    navigate(stepFor(id), 1);
  };

  const onSubmit = () => {
    if (step === 'backup-code') {
      void submitBackupCode();
      return;
    }
    if (step === 'otp') {
      void submitOtp(value);
      return;
    }
    void submitPassword();
  };

  return (
    <>
      <ReverificationView
        step={step}
        direction={direction}
        value={value}
        onValueChange={onValueChange}
        errorMessage={errorMessage}
        isPending={isPending}
        onSubmit={onSubmit}
        onVerifyPasskey={() => void submitPasskey()}
        onShowMethods={() => navigate('method-picker', 1)}
        onShowHelp={() => navigate('help', 1)}
        onBack={
          step === 'help'
            ? () => navigate('method-picker', -1)
            : step === 'method-picker'
              ? () => navigate(stepFor(methodId), -1)
              : undefined
        }
        onEmailSupport={() => setSupportRequested(true)}
        methods={allMethods.filter(method => method.id !== methodId)}
        onSelectMethod={id => void selectMethod(id)}
        otpChannel='totp'
      />
      {supportRequested ? <p>Email support requested.</p> : null}
    </>
  );
}

export function Default(): JSX.Element {
  const [runId, setRunId] = useState(0);
  const [complete, setComplete] = useState(false);

  if (complete) {
    return (
      <div>
        <p>Reverification complete.</p>
        <Button
          type='button'
          onClick={() => {
            setComplete(false);
            setRunId(current => current + 1);
          }}
        >
          Restart
        </Button>
      </div>
    );
  }

  return (
    <WorkingExample
      key={runId}
      onComplete={() => setComplete(true)}
    />
  );
}

function PasswordPanel({
  isPending = false,
  errorMessage,
}: {
  isPending?: boolean;
  errorMessage?: string;
}): JSX.Element {
  const [value, setValue] = useState(errorMessage ? 'incorrect-password' : '');

  return (
    <Card.Root renderBranding={false}>
      <ReverificationPassword
        messages={{
          title: 'Verification required',
          description: 'Enter your current password to continue',
          fieldLabel: 'Password',
          fieldPlaceholder: 'Enter your password',
          secondaryActionLabel: 'Cancel',
          primaryActionLabel: 'Continue',
          pendingLabel: 'Verifying',
        }}
        value={value}
        errorMessage={errorMessage}
        isPending={isPending}
        onValueChange={setValue}
        onSubmit={() => undefined}
        onCancel={() => setValue('')}
      />
    </Card.Root>
  );
}

export function Password(): JSX.Element {
  return <PasswordPanel />;
}

export function PasswordPending(): JSX.Element {
  return <PasswordPanel isPending />;
}

export function PasswordError(): JSX.Element {
  return <PasswordPanel errorMessage='That password is incorrect. Try again.' />;
}

function PasskeyPanel({
  isPending = false,
  errorMessage,
}: {
  isPending?: boolean;
  errorMessage?: string;
}): JSX.Element {
  return (
    <Card.Root renderBranding={false}>
      <ReverificationPasskey
        messages={{
          title: 'Use your passkey',
          description:
            'Using your passkey confirms your identity. Your device may ask for your fingerprint, face, or screen lock.',
          secondaryActionLabel: 'Cancel',
          primaryActionLabel: 'Use your passkey',
          pendingLabel: 'Verifying',
        }}
        errorMessage={errorMessage}
        isPending={isPending}
        onVerify={() => undefined}
        onCancel={() => undefined}
      />
    </Card.Root>
  );
}

export function Passkey(): JSX.Element {
  return <PasskeyPanel />;
}

export function PasskeyPending(): JSX.Element {
  return <PasskeyPanel isPending />;
}

export function PasskeyError(): JSX.Element {
  return <PasskeyPanel errorMessage='We couldn’t verify that passkey. Try again.' />;
}

function OTPPanel({
  description,
  isPending = false,
  errorMessage,
  isResending = false,
  renderResend = true,
}: {
  description: string;
  isPending?: boolean;
  errorMessage?: string;
  isResending?: boolean;
  renderResend?: boolean;
}): JSX.Element {
  const [value, setValue] = useState(isPending || errorMessage ? '123456' : '');

  return (
    <Card.Root renderBranding={false}>
      <ReverificationOTP
        messages={{
          title: 'Verification required',
          description,
          fieldLabel: 'Verification code',
          secondaryActionLabel: 'Cancel',
          primaryActionLabel: 'Continue',
          pendingLabel: 'Verifying',
        }}
        value={value}
        errorMessage={errorMessage}
        isPending={isPending}
        resend={
          renderResend
            ? {
                label: isResending ? 'Sending a new code…' : 'Didn’t receive a code? Resend',
                disabled: isResending,
                onClick: () => setValue(''),
              }
            : undefined
        }
        onValueChange={setValue}
        onSubmit={() => undefined}
        onCancel={() => setValue('')}
      />
    </Card.Root>
  );
}

export function OTP(): JSX.Element {
  return <OTPPanel description='Enter the code sent to your phone to continue' />;
}

export function AuthenticatorOTP(): JSX.Element {
  return (
    <OTPPanel
      description='Enter the code generated by your authenticator app to continue'
      renderResend={false}
    />
  );
}

export function OTPPending(): JSX.Element {
  return (
    <OTPPanel
      description='Enter the code sent to your phone to continue'
      isPending
    />
  );
}

export function OTPError(): JSX.Element {
  return (
    <OTPPanel
      description='Enter the code sent to your phone to continue'
      errorMessage='That verification code is incorrect. Try again.'
    />
  );
}

export function OTPResending(): JSX.Element {
  return (
    <OTPPanel
      description='Enter the code sent to your phone to continue'
      isResending
    />
  );
}

function BackupCodePanel({
  isPending = false,
  errorMessage,
}: {
  isPending?: boolean;
  errorMessage?: string;
}): JSX.Element {
  const [value, setValue] = useState(errorMessage ? 'invalid-code' : '');

  return (
    <Card.Root renderBranding={false}>
      <ReverificationBackupCode
        messages={{
          title: 'Enter a backup code',
          description: 'Enter the backup code you received when setting up two-step authentication',
          fieldLabel: 'Backup code',
          secondaryActionLabel: 'Cancel',
          primaryActionLabel: 'Continue',
          pendingLabel: 'Verifying',
        }}
        value={value}
        errorMessage={errorMessage}
        isPending={isPending}
        onValueChange={setValue}
        onSubmit={() => undefined}
        onCancel={() => setValue('')}
      />
    </Card.Root>
  );
}

export function BackupCode(): JSX.Element {
  return <BackupCodePanel />;
}

export function BackupCodePending(): JSX.Element {
  return <BackupCodePanel isPending />;
}

export function BackupCodeError(): JSX.Element {
  return <BackupCodePanel errorMessage='That backup code is incorrect. Try again.' />;
}

export function MethodPicker(): JSX.Element {
  const [pendingMethodId, setPendingMethodId] = useState<string>();

  return (
    <Card.Root renderBranding={false}>
      <ReverificationMethodPicker
        messages={methodPickerMessages}
        methods={[
          { id: 'password', label: 'Continue with your password', icon: 'security-lock-square' },
          { id: 'phone', label: 'Send SMS code to ••• ••• 1234', icon: 'security-phone' },
          { id: 'totp', label: 'Use your authenticator app', icon: 'security-authenticator' },
          { id: 'passkey', label: 'Use your passkey', icon: 'security-passkey' },
        ]}
        pendingMethodId={pendingMethodId}
        onSelect={setPendingMethodId}
        onHelp={() => undefined}
        onBack={() => setPendingMethodId(undefined)}
      />
    </Card.Root>
  );
}

export function MethodPickerPending(): JSX.Element {
  return (
    <Card.Root renderBranding={false}>
      <ReverificationMethodPicker
        messages={methodPickerMessages}
        methods={[
          { id: 'password', label: 'Continue with your password', icon: 'security-lock-square' },
          { id: 'phone', label: 'Send SMS code to ••• ••• 1234', icon: 'security-phone' },
          { id: 'totp', label: 'Use your authenticator app', icon: 'security-authenticator' },
          { id: 'passkey', label: 'Use your passkey', icon: 'security-passkey' },
        ]}
        pendingMethodId='phone'
        onSelect={() => undefined}
        onHelp={() => undefined}
        onBack={() => undefined}
      />
    </Card.Root>
  );
}

export function Help(): JSX.Element {
  return (
    <Card.Root renderBranding={false}>
      <ReverificationHelp
        messages={helpMessages}
        onEmailSupport={() => undefined}
        onBack={() => undefined}
      />
    </Card.Root>
  );
}
