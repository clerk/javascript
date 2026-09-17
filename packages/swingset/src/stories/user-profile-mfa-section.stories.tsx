import { Button } from '@clerk/mosaic/components/button';
import { Text } from '@clerk/mosaic/components/text';
import { UserProfileAddAuthenticatorDialog } from '@clerk/mosaic/features/user-profile/user-profile-add-authenticator.dialog';
import type { UserProfileAddSmsDialogProps } from '@clerk/mosaic/features/user-profile/user-profile-add-sms.dialog';
import { UserProfileAddSmsDialog } from '@clerk/mosaic/features/user-profile/user-profile-add-sms.dialog';
import type { UserProfileMfaMethod } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { useEffect, useRef, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-mfa-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'UserProfileMfaSection',
  label: '2-step verification',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-mfa-section.view.tsx',
};

export function Default() {
  const [defaultId, setDefaultId] = useState('personal');
  const hasFailed = useRef(false);
  const methods: UserProfileMfaMethod[] = [
    {
      id: 'personal',
      type: 'sms',
      description: '+1 801-555-0100',
      isDefault: defaultId === 'personal',
      canSetDefault: defaultId !== 'personal',
    },
    {
      id: 'work',
      type: 'sms',
      description: '+1 801-555-0200',
      isDefault: defaultId === 'work',
      canSetDefault: defaultId !== 'work',
    },
    { id: 'backup', type: 'backup-codes' },
  ];

  return (
    <UserProfileMfaSectionView
      methods={methods}
      sectionTitle='Authentication'
      onSetDefault={async id => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!hasFailed.current) {
          hasFailed.current = true;
          throw new Error('Unable to update the default method. Please try again.');
        }
        setDefaultId(id);
      }}
    />
  );
}

export function ReadOnly() {
  return (
    <UserProfileMfaSectionView
      methods={[
        { id: 'authenticator', type: 'authenticator', isDefault: true, canRemove: false },
        { id: 'sms', type: 'sms', description: '+1 801-555-0100' },
        { id: 'backup', type: 'backup-codes' },
      ]}
      sectionTitle='Authentication'
    />
  );
}

export function AddMethod() {
  const [selection, setSelection] = useState('No method selected');
  const labels = { sms: 'SMS verification', authenticator: 'Authenticator app', 'backup-codes': 'Backup codes' };

  return (
    <div className='flex w-full flex-col gap-4'>
      <UserProfileMfaSectionView
        methods={[{ id: 'sms', type: 'sms', description: '+1 801-555-0100' }]}
        addableMethods={['sms', 'authenticator', 'backup-codes']}
        onAdd={type => setSelection(labels[type])}
        sectionTitle='Authentication'
      />
      <Text role='status'>{selection}</Text>
    </div>
  );
}

export function AuthenticatorSetup() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [verified, setVerified] = useState(false);
  const hasFailed = useRef(false);

  const submit = async () => {
    if (isPending) {
      return;
    }
    setIsPending(true);
    setErrorMessage(undefined);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPending(false);
    if (!hasFailed.current) {
      hasFailed.current = true;
      setErrorMessage('That code could not be verified. Please try again.');
      return;
    }
    setVerified(true);
    setOpen(false);
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <UserProfileAddAuthenticatorDialog
        open={open}
        onOpenChange={next => {
          if (isPending) {
            return;
          }
          setOpen(next);
          setCode('');
          setErrorMessage(undefined);
          if (next) {
            setVerified(false);
            hasFailed.current = false;
          }
        }}
        trigger={
          <Button
            variant='outline'
            color='neutral'
          >
            Set up authenticator
          </Button>
        }
        secret='JBSWY3DPEHPK3PXP'
        uri='otpauth://totp/Swingset:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Swingset'
        code={code}
        onCodeChange={value => {
          setCode(value);
          setErrorMessage(undefined);
        }}
        isPending={isPending}
        errorMessage={errorMessage}
        onSubmit={() => void submit()}
      />
      {verified ? <Text role='status'>Authenticator verified in this demo</Text> : null}
    </div>
  );
}

export function SmsSetup() {
  const phoneNumbers = [
    { id: 'personal', phoneNumber: '+18015550100', verified: true },
    { id: 'work', phoneNumber: '+18015550200', verified: false },
  ];
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<UserProfileAddSmsDialogProps['step']>('select');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedPhoneId, setSelectedPhoneId] = useState('personal');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [verifyFrom, setVerifyFrom] = useState<'select' | 'phone'>('select');
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [enabledPhone, setEnabledPhone] = useState('');
  const hasFailed = useRef(false);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }
    const timeout = setTimeout(() => setResendSeconds(seconds => seconds - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendSeconds]);

  const submit = async () => {
    if (isPending || isResending) {
      return;
    }
    setIsPending(true);
    setErrorMessage(undefined);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsPending(false);
    if (step === 'verify') {
      if (!hasFailed.current) {
        hasFailed.current = true;
        setErrorMessage('That code could not be verified. Please try again.');
        return;
      }
      setEnabledPhone(phoneNumber);
      setOpen(false);
      setResendSeconds(0);
      return;
    }
    if (step === 'select') {
      const phone = phoneNumbers.find(number => number.id === selectedPhoneId);
      if (!phone) {
        return;
      }
      if (phone.verified) {
        setEnabledPhone(phone.phoneNumber);
        setOpen(false);
        return;
      }
      setPhoneNumber(phone.phoneNumber);
    }
    setVerifyFrom(step);
    setCode('');
    setResendSeconds(12);
    setDirection(1);
    setStep('verify');
  };

  const resend = async () => {
    if (isPending || isResending || resendSeconds > 0) {
      return;
    }
    setIsResending(true);
    setErrorMessage(undefined);
    setCode('');
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsResending(false);
    setResendSeconds(12);
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <UserProfileAddSmsDialog
        open={open}
        onOpenChange={next => {
          if (isPending || isResending) {
            return;
          }
          setOpen(next);
          setStep('select');
          setDirection(1);
          setSelectedPhoneId('personal');
          setPhoneNumber('');
          setCode('');
          setErrorMessage(undefined);
          setResendSeconds(0);
          if (next) {
            setEnabledPhone('');
            hasFailed.current = false;
          }
        }}
        trigger={
          <Button
            variant='outline'
            color='neutral'
          >
            Set up SMS verification
          </Button>
        }
        step={step}
        direction={direction}
        phoneNumbers={phoneNumbers}
        selectedPhoneId={selectedPhoneId}
        onSelectedPhoneIdChange={id => {
          setSelectedPhoneId(id);
          setErrorMessage(undefined);
        }}
        onAddPhone={() => {
          setPhoneNumber('');
          setErrorMessage(undefined);
          setDirection(1);
          setStep('phone');
        }}
        onBack={() => {
          setStep(step === 'verify' ? verifyFrom : 'select');
          setDirection(-1);
          setCode('');
          setErrorMessage(undefined);
          setResendSeconds(0);
        }}
        phoneNumber={phoneNumber}
        onPhoneNumberChange={value => {
          setPhoneNumber(value);
          setErrorMessage(undefined);
        }}
        code={code}
        onCodeChange={value => {
          setCode(value);
          setErrorMessage(undefined);
        }}
        onSubmit={() => void submit()}
        onResend={() => void resend()}
        isPending={isPending}
        isResending={isResending}
        resendSeconds={resendSeconds}
        errorMessage={errorMessage}
      />
      {enabledPhone ? <Text role='status'>SMS verification enabled for {enabledPhone} in this demo</Text> : null}
    </div>
  );
}

export function Removal() {
  const [methods, setMethods] = useState<UserProfileMfaMethod[]>([
    { id: 'authenticator', type: 'authenticator' },
    { id: 'sms', type: 'sms', description: '+1 801-555-0100' },
  ]);
  const hasFailed = useRef(false);
  const hasAuthenticator = methods.some(method => method.type === 'authenticator');

  return (
    <UserProfileMfaSectionView
      methods={methods.map(method => ({
        ...method,
        isDefault: method.type === 'authenticator' || !hasAuthenticator,
      }))}
      sectionTitle='Authentication'
      onRemove={async id => {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (!hasFailed.current) {
          hasFailed.current = true;
          throw new Error('Could not remove this method. Please try again.');
        }
        setMethods(current => current.filter(method => method.id !== id));
      }}
    />
  );
}

export function Empty() {
  return (
    <UserProfileMfaSectionView
      methods={[]}
      sectionTitle='Authentication'
    />
  );
}
