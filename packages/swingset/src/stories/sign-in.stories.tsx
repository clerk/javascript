import { Button } from '@clerk/mosaic/components/button';
import type { FieldsConfig } from '@clerk/mosaic/components/form';
import { useForm } from '@clerk/mosaic/components/form';
import type {
  SignInFactor,
  SignInSocialProvider,
  SignInStep,
  SignInSubmitEvent,
  SignInValues,
} from '@clerk/mosaic/features/sign-in';
import { SignInView } from '@clerk/mosaic/features/sign-in';
import { useRef, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './sign-in.stories?raw';

export const meta: StoryMeta = {
  group: 'Authentication',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'SignIn',
  label: 'Sign in',
  source: 'packages/mosaic/src/features/sign-in/sign-in.view.tsx',
};

const APPLICATION_NAME = 'Acme';
const APPLICATION_LOGO_URL = 'https://avatars.githubusercontent.com/u/49538330?v=4';
const IDENTIFIER = 'jane@acme.com';

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const socialProviders: SignInSocialProvider[] = [
  { id: 'oauth_google', name: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' },
  { id: 'oauth_github', name: 'GitHub', iconUrl: 'https://img.clerk.com/static/github.svg' },
];

const firstFactors: SignInFactor[] = [
  { id: 'password', stage: 'first', strategy: 'password' },
  { id: 'email_code', stage: 'first', strategy: 'email_code', emailAddressId: 'idn_1', identifier: 'j***@acme.com' },
];

const secondFactors: SignInFactor[] = [
  { id: 'totp', stage: 'second', strategy: 'totp' },
  { id: 'backup_code', stage: 'second', strategy: 'backup_code' },
];

const resetFactors: SignInFactor[] = [
  { id: 'reset_email', stage: 'first', strategy: 'reset_password_email_code', identifier: 'j***@acme.com' },
  { id: 'reset_phone', stage: 'first', strategy: 'reset_password_phone_code', identifier: '+1 ••• ••• 0123' },
];

const emptyValues: SignInValues = {
  identifier: '',
  password: '',
  code: '',
  backupCode: '',
  firstName: '',
  lastName: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

const newPasswordFields: FieldsConfig<SignInValues> = {
  newPassword: {
    validate: newPassword =>
      newPassword.length < 8
        ? { type: 'error', message: 'Your password must contain 8 or more characters.' }
        : undefined,
  },
  confirmPassword: {
    validate: (confirmPassword, values) =>
      confirmPassword !== values.newPassword ? { type: 'error', message: 'Passwords don’t match.' } : undefined,
  },
};

function stepFor(factor: SignInFactor, identifier: string): SignInStep {
  switch (factor.strategy) {
    case 'password':
      return { kind: 'credential', credential: 'password', identifier };
    case 'passkey':
      return { kind: 'credential', credential: 'passkey', identifier };
    case 'backup_code':
      return { kind: 'credential', credential: 'backup-code', identifier };
    case 'totp':
      return { kind: 'code', purpose: 'second-factor', channel: 'totp' };
    case 'email_code':
      return { kind: 'code', purpose: 'first-factor', channel: 'email', identifier: factor.identifier };
    case 'phone_code':
      return {
        kind: 'code',
        purpose: factor.stage === 'first' ? 'first-factor' : 'second-factor',
        channel: 'phone',
        identifier: factor.identifier,
      };
    case 'reset_password_email_code':
      return { kind: 'code', purpose: 'reset-password', channel: 'email', identifier: factor.identifier };
    case 'reset_password_phone_code':
      return { kind: 'code', purpose: 'reset-password', channel: 'phone', identifier: factor.identifier };
  }
}

function offersResend(step: SignInStep): boolean {
  return (step.kind === 'code' && step.channel !== 'totp') || (step.kind === 'notice' && step.purpose === 'email-link');
}

type Outcome = { kind: 'signed-in' } | { kind: 'signed-up' } | { kind: 'redirect'; provider: string };

function WorkingExample({ onComplete }: { onComplete: (outcome: Outcome) => void }) {
  const [step, setStep] = useState<SignInStep>({ kind: 'identifier' });
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [pendingProviderId, setPendingProviderId] = useState<string>();
  const [pendingFactorId, setPendingFactorId] = useState<string>();
  const [factorId, setFactorId] = useState('password');
  const [canResend, setCanResend] = useState(true);
  const [supportRequested, setSupportRequested] = useState(false);
  const [stage, setStage] = useState<'first' | 'second'>('first');
  const pickerReturnRef = useRef<SignInStep>({ kind: 'credential', credential: 'password', identifier: '' });
  const form = useForm<SignInValues>({
    initialValues: emptyValues,
    fields: newPasswordFields,
    onSubmit: () => settleAfter(1_500),
    onSuccess: () => onComplete({ kind: 'signed-in' }),
  });
  const { values } = form;
  const identifier = values.identifier.trim();

  const navigate = (next: SignInStep, nextDirection: -1 | 1) => {
    setDirection(nextDirection);
    setStep(next);
    form.setValue('code', '');
    form.setValue('backupCode', '');
    setErrorMessage(undefined);
    setGlobalErrorMessage(undefined);
    setCanResend(true);
  };

  const run = async (work: () => void | Promise<void>) => {
    setErrorMessage(undefined);
    setGlobalErrorMessage(undefined);
    setIsPending(true);
    await settleAfter(700);
    setIsPending(false);
    await work();
  };

  const startSecondFactor = () => {
    setStage('second');
    setFactorId('totp');
    navigate({ kind: 'code', purpose: 'second-factor', channel: 'totp' }, 1);
  };

  const submitStart = () =>
    run(() => {
      if (!identifier) {
        setErrorMessage('Enter your email address.');
        return;
      }
      if (!identifier.includes('@')) {
        setErrorMessage('Enter a valid email address.');
        return;
      }
      if (identifier.toLowerCase().includes('new')) {
        navigate({ kind: 'sign-up' }, 1);
        return;
      }
      setStage('first');
      setFactorId('password');
      navigate({ kind: 'credential', credential: 'password', identifier }, 1);
    });

  const submitPassword = () =>
    run(() => {
      if (!values.password) {
        setErrorMessage('Enter your password.');
        return;
      }
      if (values.password.toLowerCase() === 'error') {
        setErrorMessage('Password is incorrect. Try again, or use another method.');
        return;
      }
      if (values.password.toLowerCase() === 'locked') {
        navigate({ kind: 'identifier' }, -1);
        setGlobalErrorMessage('Your account is locked. You will be able to try again in 30 minutes.');
        return;
      }
      startSecondFactor();
    });

  const submitCode = (code: string) =>
    run(() => {
      if (code.length !== 6) {
        setErrorMessage('Enter the complete verification code.');
        return;
      }
      if (code === '000000') {
        setErrorMessage('Incorrect code. Try again.');
        return;
      }
      if (step.kind !== 'code') {
        return;
      }
      switch (step.purpose) {
        case 'reset-password':
          form.setValue('newPassword', '');
          form.setValue('confirmPassword', '');
          navigate({ kind: 'new-password', reason: 'forgot' }, 1);
          return;
        case 'first-factor':
          startSecondFactor();
          return;
        case 'second-factor':
          onComplete({ kind: 'signed-in' });
          return;
        case 'verify-email':
          onComplete({ kind: 'signed-up' });
          return;
      }
    });

  const submitBackupCode = () =>
    run(() => {
      if (!values.backupCode.trim()) {
        setErrorMessage('Enter a backup code.');
        return;
      }
      if (values.backupCode.toLowerCase() === 'error') {
        setErrorMessage('Incorrect backup code. Try again.');
        return;
      }
      onComplete({ kind: 'signed-in' });
    });

  const submitSignUp = () =>
    run(() => {
      if (!values.firstName.trim() || !values.lastName.trim()) {
        setGlobalErrorMessage('Enter your first and last name.');
        return;
      }
      if (!identifier.includes('@')) {
        setGlobalErrorMessage('Enter a valid email address.');
        return;
      }
      if (values.password.length < 8) {
        setGlobalErrorMessage('Your password must contain 8 or more characters.');
        return;
      }
      navigate({ kind: 'code', purpose: 'verify-email', channel: 'email', identifier }, 1);
    });

  const onSubmit = (event?: SignInSubmitEvent) => {
    if (step.kind === 'new-password') {
      form.handleSubmit(event ?? { preventDefault: () => undefined });
      return;
    }
    event?.preventDefault();
    if (isPending) {
      return;
    }
    switch (step.kind) {
      case 'identifier':
        void submitStart();
        return;
      case 'credential':
        if (step.credential === 'passkey') {
          void run(() => startSecondFactor());
          return;
        }
        void (step.credential === 'password' ? submitPassword() : submitBackupCode());
        return;
      case 'code':
        void submitCode(values.code);
        return;
      case 'sign-up':
        void submitSignUp();
        return;
      case 'notice':
        if (step.purpose === 'forgot-password') {
          const identifierForCode = step.identifier;
          void run(() =>
            navigate({ kind: 'code', purpose: 'reset-password', channel: 'email', identifier: identifierForCode }, 1),
          );
        }
        return;
      default:
        return;
    }
  };

  const onSelectProvider = (id: string) => {
    void (async () => {
      setPendingProviderId(id);
      await settleAfter(900);
      setPendingProviderId(undefined);
      onComplete({ kind: 'redirect', provider: socialProviders.find(p => p.id === id)?.name ?? id });
    })();
  };

  const stageFactors = stage === 'first' ? firstFactors : secondFactors;
  const otherFactors = stageFactors.filter(factor => factor.id !== factorId);

  const onSelectFactor = (id: string) => {
    const factor = stageFactors.find(candidate => candidate.id === id);
    if (!factor) {
      return;
    }
    void (async () => {
      setPendingFactorId(id);
      await settleAfter(700);
      setPendingFactorId(undefined);
      setFactorId(id);
      navigate(stepFor(factor, identifier), 1);
    })();
  };

  const onShowMethods = () => {
    pickerReturnRef.current = step;
    navigate({ kind: 'choice', purpose: 'methods', options: otherFactors }, 1);
  };

  const onBack = () => {
    if (step.kind === 'notice' && step.purpose === 'forgot-password') {
      navigate({ kind: 'credential', credential: 'password', identifier: step.identifier }, -1);
      return;
    }
    if (step.kind === 'new-password' || (step.kind === 'code' && step.purpose === 'reset-password')) {
      navigate({ kind: 'credential', credential: 'password', identifier }, -1);
      return;
    }
    if (step.kind === 'notice') {
      navigate({ kind: 'choice', purpose: 'methods', options: otherFactors }, -1);
      return;
    }
    if (step.kind === 'choice') {
      navigate(pickerReturnRef.current, -1);
    }
  };

  const cancelFor = (current: SignInStep) => {
    if (current.kind === 'code' && current.purpose === 'reset-password') {
      return onBack;
    }
    if (current.kind === 'code' && current.purpose === 'verify-email') {
      return undefined;
    }
    return otherFactors.length > 0 ? onShowMethods : undefined;
  };

  const onResend = () => {
    if (!canResend || isPending) {
      return;
    }
    void (async () => {
      setIsPending(true);
      await settleAfter(700);
      setIsPending(false);
      setCanResend(false);
      await settleAfter(3_000);
      setCanResend(true);
    })();
  };

  return (
    <>
      <SignInView
        step={step}
        direction={direction}
        applicationName={APPLICATION_NAME}
        applicationLogoUrl={APPLICATION_LOGO_URL}
        combined
        socialProviders={socialProviders}
        pendingProviderId={pendingProviderId}
        onSelectProvider={onSelectProvider}
        form={form}
        onSubmit={onSubmit}
        onCodeComplete={code => {
          form.setValue('code', code);
          void submitCode(code);
        }}
        isPending={isPending || form.isSubmitting}
        isDisabled={isPending || form.isSubmitting || Boolean(pendingProviderId)}
        errorMessage={errorMessage}
        globalErrorMessage={globalErrorMessage}
        newPasswordFeedback={
          values.newPassword === ''
            ? undefined
            : values.newPassword.length < 8
              ? { type: 'info', message: 'Your password must contain 8 or more characters.' }
              : { type: 'success', message: 'Your password meets all the necessary requirements.' }
        }
        onEditIdentifier={() => {
          setStage('first');
          navigate({ kind: 'identifier' }, -1);
        }}
        onForgotPassword={() => navigate({ kind: 'notice', purpose: 'forgot-password', identifier }, 1)}
        onCancel={cancelFor(step)}
        onShowHelp={() => navigate({ kind: 'notice', purpose: 'help' }, 1)}
        onBack={onBack}
        onEmailSupport={() => setSupportRequested(true)}
        pendingFactorId={pendingFactorId}
        onSelectFactor={onSelectFactor}
        onResend={offersResend(step) ? onResend : undefined}
        canResend={canResend && !isPending}
      />
      {supportRequested ? <p>Email support requested.</p> : null}
    </>
  );
}

function outcomeLabel(outcome: Outcome): string {
  switch (outcome.kind) {
    case 'signed-in':
      return 'Signed in.';
    case 'signed-up':
      return 'Account created and signed in.';
    case 'redirect':
      return `Redirecting to ${outcome.provider}…`;
  }
}

export function Default() {
  const [runId, setRunId] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>();

  return (
    <div className='min-h-136 grid w-full place-items-center'>
      {outcome ? (
        <div className='grid gap-4 text-center'>
          <p>{outcomeLabel(outcome)}</p>
          <Button
            type='button'
            onClick={() => {
              setOutcome(undefined);
              setRunId(current => current + 1);
            }}
          >
            Restart
          </Button>
        </div>
      ) : (
        <WorkingExample
          key={runId}
          onComplete={setOutcome}
        />
      )}
    </div>
  );
}

function StepPanel({
  step,
  combined = true,
  errorMessage,
  globalErrorMessage,
  isPending = false,
  pendingProviderId,
  providers = socialProviders,
  identifier,
}: {
  step: SignInStep;
  combined?: boolean;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending?: boolean;
  pendingProviderId?: string;
  providers?: SignInSocialProvider[];
  identifier?: string;
}) {
  const attempted = errorMessage && step.kind !== 'identifier' ? 'incorrect' : '';
  const form = useForm<SignInValues>({
    initialValues: {
      ...emptyValues,
      identifier:
        identifier ?? (step.kind === 'sign-up' ? 'new@acme.com' : step.kind === 'identifier' ? '' : IDENTIFIER),
      password: attempted,
      backupCode: attempted,
    },
    onSubmit: () => Promise.resolve(),
  });

  return (
    <SignInView
      step={step}
      applicationName={APPLICATION_NAME}
      applicationLogoUrl={APPLICATION_LOGO_URL}
      combined={combined}
      socialProviders={providers}
      pendingProviderId={pendingProviderId}
      onSelectProvider={() => undefined}
      form={form}
      onSubmit={event => event?.preventDefault()}
      onCodeComplete={code => form.setValue('code', code)}
      isPending={isPending}
      isDisabled={isPending || Boolean(pendingProviderId)}
      errorMessage={errorMessage}
      globalErrorMessage={globalErrorMessage}
      onEditIdentifier={() => undefined}
      onSignUp={combined ? undefined : () => undefined}
      onForgotPassword={() => undefined}
      onCancel={step.kind === 'code' && step.purpose === 'verify-email' ? undefined : () => undefined}
      onShowHelp={() => undefined}
      onBack={() => undefined}
      onEmailSupport={() => undefined}
      onSelectFactor={() => undefined}
      onResend={offersResend(step) ? () => undefined : undefined}
      canResend
    />
  );
}

const passwordStep: SignInStep = { kind: 'credential', credential: 'password', identifier: IDENTIFIER };

export function IdentifierDefault() {
  return <StepPanel step={{ kind: 'identifier' }} />;
}

export function IdentifierSignInOnly() {
  return (
    <StepPanel
      step={{ kind: 'identifier' }}
      combined={false}
    />
  );
}

export function IdentifierManyProviders() {
  return (
    <StepPanel
      step={{ kind: 'identifier' }}
      providers={[
        ...socialProviders,
        { id: 'oauth_apple', name: 'Apple', iconUrl: 'https://img.clerk.com/static/apple.svg' },
        { id: 'oauth_microsoft', name: 'Microsoft', iconUrl: 'https://img.clerk.com/static/microsoft.svg' },
      ]}
    />
  );
}

export function IdentifierProviderPending() {
  return (
    <StepPanel
      step={{ kind: 'identifier' }}
      pendingProviderId='oauth_google'
    />
  );
}

export function IdentifierError() {
  return (
    <StepPanel
      step={{ kind: 'identifier' }}
      errorMessage='Enter a valid email address.'
    />
  );
}

export function IdentifierLocked() {
  return (
    <StepPanel
      step={{ kind: 'identifier' }}
      combined={false}
      identifier={IDENTIFIER}
      globalErrorMessage='Your account is locked. You will be able to try again in 30 minutes. For more information, please contact support.'
    />
  );
}

export function IdentifierBannerError() {
  return (
    <StepPanel
      step={{ kind: 'identifier' }}
      globalErrorMessage='Too many requests. Try again in a few minutes.'
    />
  );
}

export function CredentialPassword() {
  return <StepPanel step={passwordStep} />;
}

export function CredentialPasswordPending() {
  return (
    <StepPanel
      step={passwordStep}
      isPending
    />
  );
}

export function CredentialPasswordError() {
  return (
    <StepPanel
      step={passwordStep}
      errorMessage='Password is incorrect. Try again, or use another method.'
    />
  );
}

export function CredentialBackupCode() {
  return <StepPanel step={{ kind: 'credential', credential: 'backup-code', identifier: IDENTIFIER }} />;
}

export function CodeEmail() {
  return <StepPanel step={{ kind: 'code', purpose: 'first-factor', channel: 'email', identifier: IDENTIFIER }} />;
}

export function CodeAuthenticatorApp() {
  return <StepPanel step={{ kind: 'code', purpose: 'second-factor', channel: 'totp' }} />;
}

export function CodeResetPassword() {
  return <StepPanel step={{ kind: 'code', purpose: 'reset-password', channel: 'email', identifier: IDENTIFIER }} />;
}

export function CodeResetPasswordPhone() {
  return (
    <StepPanel step={{ kind: 'code', purpose: 'reset-password', channel: 'phone', identifier: '+1 ••• ••• 0123' }} />
  );
}

export function CodeVerifyEmail() {
  return <StepPanel step={{ kind: 'code', purpose: 'verify-email', channel: 'email', identifier: 'new@acme.com' }} />;
}

export function ChoiceMethods() {
  return <StepPanel step={{ kind: 'choice', purpose: 'methods', options: firstFactors.slice(1) }} />;
}

export function ChoiceResetMethods() {
  return <StepPanel step={{ kind: 'choice', purpose: 'reset-methods', options: resetFactors }} />;
}

export function NoticeHelp() {
  return <StepPanel step={{ kind: 'notice', purpose: 'help' }} />;
}

const forgotPasswordStep: SignInStep = { kind: 'notice', purpose: 'forgot-password', identifier: IDENTIFIER };

export function NoticeForgotPassword() {
  return <StepPanel step={forgotPasswordStep} />;
}

export function NoticeForgotPasswordPending() {
  return (
    <StepPanel
      step={forgotPasswordStep}
      isPending
    />
  );
}

export function NoticeNoMethods() {
  return <StepPanel step={{ kind: 'notice', purpose: 'no-methods' }} />;
}

export function NoticeActionBlocked() {
  return (
    <StepPanel
      step={{
        kind: 'notice',
        purpose: 'action-blocked',
        details: { linkUrl: 'https://acme.com/support', linkText: 'Contact support', traceId: 'trc_2x7Hq9LmP4' },
      }}
    />
  );
}

export function NoticePasswordCompromised() {
  return <StepPanel step={{ kind: 'notice', purpose: 'password-compromised' }} />;
}

export function NoticePasswordCompromisedPending() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'password-compromised' }}
      isPending
    />
  );
}

export function NoticeEmailLinkSent() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link', identifier: IDENTIFIER }} />;
}

export function CredentialPasskey() {
  return <StepPanel step={{ kind: 'credential', credential: 'passkey', identifier: IDENTIFIER }} />;
}

export function NewPasswordReset() {
  return <StepPanel step={{ kind: 'new-password', reason: 'forgot' }} />;
}

export function SignUpDetails() {
  return <StepPanel step={{ kind: 'sign-up' }} />;
}
