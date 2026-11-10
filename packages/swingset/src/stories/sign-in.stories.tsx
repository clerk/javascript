import { Button } from '@clerk/mosaic/components/button';
import type { FieldsConfig } from '@clerk/mosaic/components/form';
import { useForm } from '@clerk/mosaic/components/form';
import type {
  NewPasswordValues,
  SignInFactor,
  SignInSocialProvider,
  SignInStep,
  SignUpDetails,
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

const emptySignUp: SignUpDetails = { firstName: '', lastName: '', emailAddress: '', password: '' };

const emptyNewPassword: NewPasswordValues = { password: '', confirmPassword: '', signOutOfOtherSessions: true };

const newPasswordFields: FieldsConfig<NewPasswordValues> = {
  password: {
    validate: password =>
      password.length < 8 ? { type: 'error', message: 'Your password must contain 8 or more characters.' } : undefined,
  },
  confirmPassword: {
    validate: (confirmPassword, values) =>
      confirmPassword !== values.password ? { type: 'error', message: 'Passwords don’t match.' } : undefined,
  },
};

function stepFor(factor: SignInFactor, identifier: string): SignInStep {
  switch (factor.strategy) {
    case 'password':
    case 'passkey':
      return { kind: 'secret', secret: 'password', identifier };
    case 'backup_code':
      return { kind: 'secret', secret: 'backup-code', identifier };
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

type Outcome = { kind: 'signed-in' } | { kind: 'signed-up' } | { kind: 'redirect'; provider: string };

function WorkingExample({ onComplete }: { onComplete: (outcome: Outcome) => void }) {
  const [step, setStep] = useState<SignInStep>({ kind: 'identifier' });
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [identifier, setIdentifier] = useState('');
  const [value, setValue] = useState('');
  const valueRef = useRef(value);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [pendingProviderId, setPendingProviderId] = useState<string>();
  const [pendingFactorId, setPendingFactorId] = useState<string>();
  const [factorId, setFactorId] = useState('password');
  const [canResend, setCanResend] = useState(true);
  const [signUpDetails, setSignUpDetails] = useState<SignUpDetails>(emptySignUp);
  const [signUpErrors, setSignUpErrors] = useState<Partial<Record<keyof SignUpDetails, string>>>();
  const newPasswordForm = useForm<NewPasswordValues>({
    initialValues: emptyNewPassword,
    fields: newPasswordFields,
    onSubmit: () => settleAfter(1_500),
    onSuccess: () => onComplete({ kind: 'signed-in' }),
  });
  const [supportRequested, setSupportRequested] = useState(false);
  const [stage, setStage] = useState<'first' | 'second'>('first');
  const pickerReturnRef = useRef<SignInStep>({ kind: 'secret', secret: 'password', identifier: '' });

  const navigate = (next: SignInStep, nextDirection: -1 | 1) => {
    setDirection(nextDirection);
    setStep(next);
    valueRef.current = '';
    setValue('');
    setErrorMessage(undefined);
    setCanResend(true);
  };

  const onValueChange = (nextValue: string) => {
    valueRef.current = nextValue;
    setValue(nextValue);
    setErrorMessage(undefined);
  };

  const run = async (work: () => void | Promise<void>) => {
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
      const email = identifier.trim();
      if (!email) {
        setErrorMessage('Enter your email address.');
        return;
      }
      if (!email.includes('@')) {
        setErrorMessage('Enter a valid email address.');
        return;
      }
      if (email.toLowerCase().includes('new')) {
        setSignUpDetails({ ...emptySignUp, emailAddress: email });
        navigate({ kind: 'sign-up' }, 1);
        return;
      }
      setStage('first');
      setFactorId('password');
      navigate({ kind: 'secret', secret: 'password', identifier: email }, 1);
    });

  const submitPassword = () =>
    run(() => {
      const password = valueRef.current;
      if (!password) {
        setErrorMessage('Enter your password.');
        return;
      }
      if (password.toLowerCase() === 'error') {
        setErrorMessage('Password is incorrect. Try again, or use another method.');
        return;
      }
      startSecondFactor();
    });

  const submitCode = (onSuccess: () => void) =>
    run(() => {
      const code = valueRef.current;
      if (code.length !== 6) {
        setErrorMessage('Enter the complete verification code.');
        return;
      }
      if (code === '000000') {
        setErrorMessage('Incorrect code. Try again.');
        return;
      }
      onSuccess();
    });

  const submitBackupCode = () =>
    run(() => {
      const code = valueRef.current;
      if (!code.trim()) {
        setErrorMessage('Enter a backup code.');
        return;
      }
      if (code.toLowerCase() === 'error') {
        setErrorMessage('Incorrect backup code. Try again.');
        return;
      }
      onComplete({ kind: 'signed-in' });
    });

  const submitSignUp = () =>
    run(() => {
      const errors: Partial<Record<keyof SignUpDetails, string>> = {};
      if (!signUpDetails.firstName.trim()) {
        errors.firstName = 'Enter your first name.';
      }
      if (!signUpDetails.lastName.trim()) {
        errors.lastName = 'Enter your last name.';
      }
      if (!signUpDetails.emailAddress.includes('@')) {
        errors.emailAddress = 'Enter a valid email address.';
      }
      if (signUpDetails.password.length < 8) {
        errors.password = 'Your password must contain 8 or more characters.';
      }
      if (Object.keys(errors).length > 0) {
        setSignUpErrors(errors);
        return;
      }
      setSignUpErrors(undefined);
      navigate({ kind: 'code', purpose: 'verify-email', channel: 'email', identifier: signUpDetails.emailAddress }, 1);
    });

  const onSubmit = () => {
    switch (step.kind) {
      case 'identifier':
        void submitStart();
        return;
      case 'secret':
        void (step.secret === 'password' ? submitPassword() : submitBackupCode());
        return;
      case 'code':
        if (step.purpose === 'reset-password') {
          void submitCode(() => {
            newPasswordForm.reset();
            navigate({ kind: 'new-password', reason: 'forgot' }, 1);
          });
        } else if (step.purpose === 'first-factor') {
          void submitCode(startSecondFactor);
        } else if (step.purpose === 'second-factor') {
          void submitCode(() => onComplete({ kind: 'signed-in' }));
        } else {
          void submitCode(() => onComplete({ kind: 'signed-up' }));
        }
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
      navigate({ kind: 'secret', secret: 'password', identifier: step.identifier }, -1);
      return;
    }
    if (step.kind === 'new-password') {
      navigate({ kind: 'secret', secret: 'password', identifier }, -1);
      return;
    }
    if (step.kind === 'code' && step.purpose === 'reset-password') {
      navigate({ kind: 'secret', secret: 'password', identifier }, -1);
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
        identifier={identifier}
        onIdentifierChange={next => {
          setIdentifier(next);
          setErrorMessage(undefined);
        }}
        onEditIdentifier={() => {
          setStage('first');
          navigate({ kind: 'identifier' }, -1);
        }}
        value={value}
        onValueChange={onValueChange}
        errorMessage={errorMessage}
        isPending={isPending}
        onSubmit={onSubmit}
        onForgotPassword={() => navigate({ kind: 'notice', purpose: 'forgot-password', identifier }, 1)}
        onShowMethods={otherFactors.length > 0 ? onShowMethods : undefined}
        onShowHelp={() => navigate({ kind: 'notice', purpose: 'help' }, 1)}
        onBack={onBack}
        onEmailSupport={() => setSupportRequested(true)}
        pendingFactorId={pendingFactorId}
        onSelectFactor={onSelectFactor}
        onResend={onResend}
        canResend={canResend}
        signUpDetails={signUpDetails}
        signUpErrors={signUpErrors}
        onSignUpDetailChange={(field, next) => {
          setSignUpDetails(current => ({ ...current, [field]: next }));
          setSignUpErrors(current => (current ? { ...current, [field]: undefined } : current));
        }}
        newPasswordForm={newPasswordForm}
        newPasswordFeedback={
          newPasswordForm.values.password === ''
            ? undefined
            : newPasswordForm.values.password.length < 8
              ? { type: 'info', message: 'Your password must contain 8 or more characters.' }
              : { type: 'success', message: 'Your password meets all the necessary requirements.' }
        }
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
  isPending = false,
  pendingProviderId,
  providers = socialProviders,
}: {
  step: SignInStep;
  combined?: boolean;
  errorMessage?: string;
  isPending?: boolean;
  pendingProviderId?: string;
  providers?: SignInSocialProvider[];
}) {
  const [value, setValue] = useState(errorMessage && step.kind !== 'identifier' ? 'incorrect' : '');
  const [details, setDetails] = useState<SignUpDetails>({ ...emptySignUp, emailAddress: 'new@acme.com' });
  const newPasswordForm = useForm<NewPasswordValues>({
    initialValues: emptyNewPassword,
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
      identifier={step.kind === 'identifier' ? value : IDENTIFIER}
      onIdentifierChange={setValue}
      onEditIdentifier={() => undefined}
      onSignUp={() => undefined}
      value={value}
      onValueChange={setValue}
      errorMessage={errorMessage}
      isPending={isPending}
      onSubmit={() => undefined}
      onForgotPassword={() => undefined}
      onShowMethods={() => undefined}
      onShowHelp={() => undefined}
      onBack={() => undefined}
      onEmailSupport={() => undefined}
      onSelectFactor={() => undefined}
      onResend={() => undefined}
      canResend
      signUpDetails={details}
      onSignUpDetailChange={(field, next) => setDetails(current => ({ ...current, [field]: next }))}
      newPasswordForm={newPasswordForm}
    />
  );
}

const passwordStep: SignInStep = { kind: 'secret', secret: 'password', identifier: IDENTIFIER };

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

export function SecretPassword() {
  return <StepPanel step={passwordStep} />;
}

export function SecretPasswordPending() {
  return (
    <StepPanel
      step={passwordStep}
      isPending
    />
  );
}

export function SecretPasswordError() {
  return (
    <StepPanel
      step={passwordStep}
      errorMessage='Password is incorrect. Try again, or use another method.'
    />
  );
}

export function SecretBackupCode() {
  return <StepPanel step={{ kind: 'secret', secret: 'backup-code', identifier: IDENTIFIER }} />;
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

export function NewPasswordReset() {
  return <StepPanel step={{ kind: 'new-password', reason: 'forgot' }} />;
}

export function SignUpDetails() {
  return <StepPanel step={{ kind: 'sign-up' }} />;
}
