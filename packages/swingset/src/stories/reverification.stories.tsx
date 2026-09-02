import type { ReverificationState } from '@clerk/ui/mosaic/blocks/reverification';
import {
  Reverification,
  ReverificationBackupCode,
  ReverificationHelp,
  ReverificationMethodPicker,
  ReverificationOTP,
  ReverificationPasskey,
  ReverificationPassword,
} from '@clerk/ui/mosaic/blocks/reverification';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Card } from '@clerk/ui/mosaic/components/card';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './reverification.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'Reverification',
  source: 'packages/ui/src/mosaic/blocks/reverification/reverification.tsx',
};

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const actions = {
  secondaryActionLabel: 'Use another method',
  primaryActionLabel: 'Continue',
  pendingLabel: 'Verifying',
};

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

function ReverificationStoryCard({ children }: { children: ReactNode }): JSX.Element {
  return <Card.Root>{children}</Card.Root>;
}

const methodPresentation = {
  password: { label: 'Continue with your password', icon: 'security-lock-square' },
  otp: { label: 'Use your authenticator app', icon: 'security-authenticator' },
  'backup-code': { label: 'Use a backup code', icon: 'security-phone' },
  passkey: { label: 'Use your passkey', icon: 'security-passkey' },
} satisfies Record<string, Omit<ReverificationState['methodPicker']['methods'][number], 'id'>>;

type MethodId = keyof typeof methodPresentation;

function WorkingExample({ onComplete }: { onComplete: () => void }): JSX.Element {
  const [status, setStatus] = useState<ReverificationState['status']>('password');
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [methodId, setMethodId] = useState<MethodId>('password');
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [pendingMethod, setPendingMethod] = useState<MethodId>();
  const [pendingMethodId, setPendingMethodId] = useState<string>();
  const [isResending, setIsResending] = useState(false);
  const [supportRequested, setSupportRequested] = useState(false);

  const navigate = (nextStatus: ReverificationState['status'], nextDirection: -1 | 1) => {
    setDirection(nextDirection);
    setStatus(nextStatus);
    setValue('');
    setFieldError(undefined);
  };

  const onValueChange = (nextValue: string) => {
    setValue(nextValue);
    setFieldError(undefined);
  };

  const submitPassword = async () => {
    if (!value.trim()) {
      setFieldError('This field is required.');
      return;
    }
    setPendingMethod('password');
    await settleAfter(700);
    setPendingMethod(undefined);
    if (value.toLowerCase() === 'error') {
      setFieldError('That password is incorrect. Try again.');
      return;
    }
    onComplete();
  };

  const submitOtp = async (code: string) => {
    if (code.length !== 6) {
      setFieldError('Enter the complete verification code.');
      return;
    }
    setPendingMethod('otp');
    await settleAfter(700);
    setPendingMethod(undefined);
    if (code === '000000') {
      setFieldError('That verification code is incorrect. Try again.');
      return;
    }
    onComplete();
  };

  const submitBackupCode = async () => {
    if (!value.trim()) {
      setFieldError('This field is required.');
      return;
    }
    setPendingMethod('backup-code');
    await settleAfter(700);
    setPendingMethod(undefined);
    if (value.toLowerCase() === 'error') {
      setFieldError('That backup code is incorrect. Try again.');
      return;
    }
    onComplete();
  };

  const submitPasskey = async () => {
    setPendingMethod('passkey');
    await settleAfter(700);
    setPendingMethod(undefined);
    onComplete();
  };

  const selectMethod = async (id: string) => {
    const nextMethodId = id as MethodId;
    setPendingMethodId(id);
    await settleAfter(700);
    setPendingMethodId(undefined);
    setMethodId(nextMethodId);
    navigate(nextMethodId, 1);
  };

  const resend = async () => {
    setIsResending(true);
    await settleAfter(700);
    setIsResending(false);
    onValueChange('');
  };

  const showMethods = () => navigate('method-picker', -1);
  const viewState: ReverificationState = {
    status,
    password: {
      messages: {
        title: 'Verification required',
        description: 'Enter your current password to continue',
        fieldLabel: 'Password',
        fieldPlaceholder: 'Enter your password',
        ...actions,
      },
      value,
      errorMessage: fieldError,
      isPending: pendingMethod === 'password',
      onValueChange,
      onSubmit: () => void submitPassword(),
      onCancel: showMethods,
    },
    passkey: {
      messages: {
        title: 'Use your passkey',
        description:
          'Using your passkey confirms your identity. Your device may ask for your fingerprint, face, or screen lock.',
        ...actions,
      },
      isPending: pendingMethod === 'passkey',
      onVerify: () => void submitPasskey(),
      onCancel: showMethods,
    },
    otp: {
      messages: {
        title: 'Verification required',
        description: 'Enter the code generated by your authenticator app to continue',
        fieldLabel: 'Verification code',
        ...actions,
      },
      value,
      errorMessage: fieldError,
      isPending: pendingMethod === 'otp',
      resend: {
        label: isResending ? 'Sending a new code…' : 'Didn’t receive a code? Resend',
        disabled: isResending || pendingMethod === 'otp',
        onClick: () => void resend(),
      },
      onValueChange,
      onComplete: code => void submitOtp(code),
      onSubmit: () => void submitOtp(value),
      onCancel: showMethods,
    },
    backupCode: {
      messages: {
        title: 'Enter a backup code',
        description: 'Enter the backup code you received when setting up two-step authentication',
        fieldLabel: 'Backup code',
        ...actions,
      },
      value,
      errorMessage: fieldError,
      isPending: pendingMethod === 'backup-code',
      onValueChange,
      onSubmit: () => void submitBackupCode(),
      onCancel: showMethods,
    },
    methodPicker: {
      messages: methodPickerMessages,
      methods: (Object.keys(methodPresentation) as MethodId[])
        .filter(id => id !== methodId)
        .map(id => ({ id, ...methodPresentation[id] })),
      pendingMethodId,
      onSelect: id => void selectMethod(id),
      onHelp: () => navigate('help', 1),
      onBack: () => navigate(methodId, 1),
    },
    help: {
      messages: helpMessages,
      onEmailSupport: () => setSupportRequested(true),
      onBack: () => navigate('method-picker', -1),
    },
  };

  return (
    <>
      <Reverification
        state={viewState}
        direction={direction}
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
    <ReverificationStoryCard>
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
    </ReverificationStoryCard>
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
    <ReverificationStoryCard>
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
    </ReverificationStoryCard>
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
    <ReverificationStoryCard>
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
    </ReverificationStoryCard>
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
    <ReverificationStoryCard>
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
    </ReverificationStoryCard>
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
    <ReverificationStoryCard>
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
    </ReverificationStoryCard>
  );
}

export function MethodPickerPending(): JSX.Element {
  return (
    <ReverificationStoryCard>
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
    </ReverificationStoryCard>
  );
}

export function Help(): JSX.Element {
  return (
    <ReverificationStoryCard>
      <ReverificationHelp
        messages={helpMessages}
        onEmailSupport={() => undefined}
        onBack={() => undefined}
      />
    </ReverificationStoryCard>
  );
}
