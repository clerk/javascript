import type { UserProfileAddAuthenticatorDialogProps } from '@clerk/mosaic/features/user-profile/user-profile-add-authenticator.dialog';
import type { UserProfileAddSmsDialogProps } from '@clerk/mosaic/features/user-profile/user-profile-add-sms.dialog';
import type { UserProfileBackupCodesDialogProps } from '@clerk/mosaic/features/user-profile/user-profile-backup-codes.dialog';
import type {
  UserProfileMfaAddableMethod,
  UserProfileMfaMethod,
  UserProfileMfaSectionViewProps,
} from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';
import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { useEffect, useState } from 'react';

import { authenticatorSetup } from './user-profile-authenticator';

interface FixtureOptions {
  initialFlow?: UserProfileMfaAddableMethod;
  enrollmentBackupCodes?: readonly string[];
  onGenerateBackupCodes?: () => Promise<readonly string[]>;
  onCopy: (codes: readonly string[]) => Promise<void>;
  onDownload: (codes: readonly string[]) => void | Promise<void>;
}

export const mfaDemoOptions: FixtureOptions = {
  enrollmentBackupCodes: [
    'pwkkay19',
    'cvgunlqs',
    '4czio578',
    'a38eewtw',
    'qqnwzvyr',
    'znq8j16s',
    'k4ro51h1',
    '1gjmkwdb',
    'pnr8i06f',
    'ycga0jge',
  ],
  onGenerateBackupCodes: () =>
    Promise.resolve([
      'demo-new-01',
      'demo-new-02',
      'demo-new-03',
      'demo-new-04',
      'demo-new-05',
      'demo-new-06',
      'demo-new-07',
      'demo-new-08',
      'demo-new-09',
      'demo-new-10',
    ]),
  onCopy: codes => navigator.clipboard.writeText(codes.join('\n')),
  onDownload: codes => {
    const blob = new Blob(['Swingset demo backup codes\n\n', codes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'swingset-backup-codes.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  },
};

const pause = () => new Promise(resolve => setTimeout(resolve, 600));

export function useUserProfileMfaFixture({
  initialFlow,
  enrollmentBackupCodes,
  onGenerateBackupCodes,
  onCopy,
  onDownload,
}: FixtureOptions = mfaDemoOptions): {
  setup: {
    open: boolean;
    step: UserProfileMfaAddableMethod | 'select';
    onOpenChange: (open: boolean) => void;
  };
  section: UserProfileMfaSectionViewProps;
  authenticator: UserProfileAddAuthenticatorDialogProps;
  sms: UserProfileAddSmsDialogProps;
  backupCodes: UserProfileBackupCodesDialogProps;
} {
  const [account, setAccount] = useState({
    phones: [
      { id: 'personal', phoneNumber: '+18015550100', verified: true, enrolled: true },
      { id: 'work', phoneNumber: '+14165550100', verified: false, enrolled: false },
      { id: 'other', phoneNumber: '+18015550200', verified: true, enrolled: false },
    ],
    authenticator: false,
    defaultPhoneId: 'personal',
    hasBackupCodes: initialFlow === 'backup-codes' && Boolean(enrollmentBackupCodes?.length),
  });
  const [flow, setFlow] = useState<UserProfileMfaAddableMethod | 'select' | undefined>(initialFlow);
  const [pending, setPending] = useState<'submit' | 'resend' | 'generate' | 'copy' | 'download'>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<readonly string[]>(
    initialFlow === 'backup-codes' ? (enrollmentBackupCodes ?? []) : [],
  );
  const [step, setStep] = useState<UserProfileAddSmsDialogProps['step']>('select');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [verifyFrom, setVerifyFrom] = useState<'select' | 'phone'>('select');
  const [selectedPhoneId, setSelectedPhoneId] = useState(() => account.phones.find(phone => !phone.enrolled)?.id ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }
    const timeout = setTimeout(() => setResendSeconds(seconds => seconds - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendSeconds]);

  const eligiblePhones = account.phones.filter(phone => !phone.enrolled);
  const enrolledPhones = account.phones.filter(phone => phone.enrolled);
  const defaultPhoneId = enrolledPhones.some(phone => phone.id === account.defaultPhoneId)
    ? account.defaultPhoneId
    : enrolledPhones[0]?.id;
  enrolledPhones.sort((left, right) => Number(right.id === defaultPhoneId) - Number(left.id === defaultPhoneId));
  const methods: UserProfileMfaMethod[] = [
    ...(account.authenticator ? [{ id: 'authenticator', type: 'authenticator' as const, isDefault: true }] : []),
    ...enrolledPhones.map(phone => {
      const isDefault = !account.authenticator && phone.id === defaultPhoneId;
      return {
        id: phone.id,
        type: 'sms' as const,
        description: stringToFormattedPhoneString(phone.phoneNumber),
        isDefault,
        canSetDefault: !isDefault,
      };
    }),
    ...(account.hasBackupCodes ? [{ id: 'backup', type: 'backup-codes' as const }] : []),
  ];
  const addableMethods: UserProfileMfaAddableMethod[] = ['sms'];
  if (!account.authenticator) {
    addableMethods.push('authenticator');
  }
  if (onGenerateBackupCodes && !account.hasBackupCodes && (account.authenticator || enrolledPhones.length > 0)) {
    addableMethods.push('backup-codes');
  }
  const generateBackupCodes = async () => {
    if (pending || !onGenerateBackupCodes) {
      return;
    }
    setFlow('backup-codes');
    setPending('generate');
    setErrorMessage(undefined);
    setCodes([]);
    try {
      const nextCodes = await onGenerateBackupCodes();
      if (nextCodes.length === 0) {
        throw new Error('No backup codes returned');
      }
      setCodes(nextCodes);
      setAccount(current => ({ ...current, hasBackupCodes: true }));
    } catch {
      setErrorMessage('Unable to generate backup codes. Please try again.');
    } finally {
      setPending(undefined);
    }
  };

  const open = (type: UserProfileMfaAddableMethod) => {
    if (pending || !addableMethods.includes(type)) {
      return;
    }
    if (type === 'backup-codes') {
      void generateBackupCodes();
      return;
    }
    setCode('');
    setErrorMessage(undefined);
    setResendSeconds(0);
    setPhoneNumber('');
    setSelectedPhoneId(eligiblePhones[0]?.id ?? '');
    setStep(eligiblePhones.length > 0 ? 'select' : 'phone');
    setDirection(1);
    setFlow(type);
  };

  const close = (next: boolean) => {
    if (!next && !pending) {
      setFlow(undefined);
      setResendSeconds(0);
    }
  };

  const finishEnrollment = () => {
    setResendSeconds(0);
    setPending(undefined);
    if (!account.hasBackupCodes && enrollmentBackupCodes?.length) {
      setCodes(enrollmentBackupCodes);
      setAccount(current => ({ ...current, hasBackupCodes: true }));
      setFlow('backup-codes');
    } else {
      setFlow(undefined);
    }
  };

  const verifyAuthenticator = async (value: string) => {
    if (pending || !/^\d{6}$/.test(value)) {
      return;
    }
    setErrorMessage(undefined);
    setPending('submit');
    await pause();
    if (value === '000000') {
      setErrorMessage('That code is incorrect. Try again.');
      setPending(undefined);
      return;
    }
    setAccount(current => ({ ...current, authenticator: true }));
    finishEnrollment();
  };

  const submitSms = async (value = code) => {
    if (pending) {
      return;
    }
    if (step === 'verify' && !/^\d{6}$/.test(value)) {
      setErrorMessage('Enter the six-digit verification code.');
      return;
    }
    const phone =
      step === 'select'
        ? eligiblePhones.find(item => item.id === selectedPhoneId)
        : account.phones.find(item => item.phoneNumber === phoneNumber);
    const number = phone?.phoneNumber ?? phoneNumber;
    if (!/^\+[1-9]\d{6,14}$/.test(number)) {
      setErrorMessage('Enter a valid phone number.');
      return;
    }
    if (phone?.enrolled) {
      setErrorMessage('SMS verification is already enabled for this number.');
      return;
    }
    setErrorMessage(undefined);
    setPending('submit');
    await pause();
    if (step === 'verify' && value === '000000') {
      setErrorMessage('That code is incorrect. Try again.');
      setPending(undefined);
      return;
    }
    if (step === 'verify' || phone?.verified) {
      const enrolled = { id: phone?.id ?? `phone-${number}`, phoneNumber: number, verified: true, enrolled: true };
      setAccount(current => ({
        ...current,
        phones: phone
          ? current.phones.map(item => (item.id === phone.id ? enrolled : item))
          : [...current.phones, enrolled],
      }));
      finishEnrollment();
      return;
    }
    setPhoneNumber(number);
    setVerifyFrom(step);
    setCode('');
    setStep('verify');
    setDirection(1);
    setResendSeconds(12);
    setPending(undefined);
  };

  const resend = async () => {
    if (pending || resendSeconds > 0) {
      return;
    }
    setPending('resend');
    setCode('');
    setErrorMessage(undefined);
    await pause();
    setPending(undefined);
    setResendSeconds(12);
  };

  const save = async (action: 'copy' | 'download') => {
    if (pending) {
      return;
    }
    setPending(action);
    setErrorMessage(undefined);
    try {
      await (action === 'copy' ? onCopy(codes) : onDownload(codes));
      if (action === 'copy') {
        setFlow(undefined);
      }
    } catch {
      setErrorMessage(
        action === 'copy'
          ? 'Unable to copy backup codes. Please try again or download them.'
          : 'Unable to download backup codes. Please try again or copy them.',
      );
    } finally {
      setPending(undefined);
    }
  };

  const onCodeChange = (value: string) => {
    setCode(value);
    setErrorMessage(undefined);
  };

  return {
    setup: {
      open: flow !== undefined,
      step: flow ?? 'select',
      onOpenChange: next => {
        if (next && !pending) {
          setFlow('select');
        } else {
          close(next);
        }
      },
    },
    section: {
      methods,
      addableMethods,
      sectionTitle: 'Authentication',
      onAdd: open,
      onRegenerateBackupCodes:
        account.hasBackupCodes && onGenerateBackupCodes ? () => void generateBackupCodes() : undefined,
      onSetDefault: async id => {
        await pause();
        setAccount(current => ({ ...current, defaultPhoneId: id }));
      },
      onRemove: async id => {
        await pause();
        const phones = account.phones.map(phone => (phone.id === id ? { ...phone, enrolled: false } : phone));
        const authenticator = id === 'authenticator' ? false : account.authenticator;
        const hasSecondFactor = authenticator || phones.some(phone => phone.enrolled);
        setAccount(current => ({
          ...current,
          phones,
          authenticator,
          hasBackupCodes: current.hasBackupCodes && hasSecondFactor,
        }));
        if (!hasSecondFactor) {
          setCodes([]);
          setFlow(undefined);
        }
      },
    },
    authenticator: {
      open: flow === 'authenticator',
      onOpenChange: close,
      setup: authenticatorSetup,
      onRetry: () => undefined,
      code,
      onCodeChange,
      onSubmit: value => void verifyAuthenticator(value),
      isPending: pending === 'submit',
      errorMessage,
    },
    sms: {
      open: flow === 'sms',
      onOpenChange: close,
      step,
      direction,
      phoneNumbers: eligiblePhones,
      selectedPhoneId,
      onSelectedPhoneIdChange: id => {
        setSelectedPhoneId(id);
        setErrorMessage(undefined);
      },
      onAddPhone: () => {
        setPhoneNumber('');
        setErrorMessage(undefined);
        setDirection(1);
        setStep('phone');
      },
      onBack: () => {
        if (step === 'phone' && eligiblePhones.length === 0) {
          close(false);
          return;
        }
        setStep(step === 'verify' ? verifyFrom : 'select');
        setDirection(-1);
        setCode('');
        setErrorMessage(undefined);
        setResendSeconds(0);
      },
      phoneNumber,
      onPhoneNumberChange: value => {
        setPhoneNumber(value);
        setErrorMessage(undefined);
      },
      code,
      onCodeChange,
      onSubmit: value => void submitSms(value),
      onResend: () => void resend(),
      isPending: pending === 'submit',
      isResending: pending === 'resend',
      resendSeconds,
      errorMessage,
    },
    backupCodes: {
      open: flow === 'backup-codes',
      onOpenChange: close,
      codes,
      pendingAction: pending === 'generate' || pending === 'copy' || pending === 'download' ? pending : undefined,
      errorMessage,
      onRetry: () => {
        if (!pending) {
          void generateBackupCodes();
        }
      },
      onCopy: () => void save('copy'),
      onDownload: () => void save('download'),
    },
  };
}
