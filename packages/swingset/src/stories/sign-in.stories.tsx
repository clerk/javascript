import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import type { SignInMethod, SignInSocialProvider, SignInStep, SignUpDetails } from '@clerk/mosaic/features/sign-in';
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

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const socialProviders: SignInSocialProvider[] = [
  { id: 'oauth_google', name: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' },
  { id: 'oauth_github', name: 'GitHub', iconUrl: 'https://img.clerk.com/static/github.svg' },
];

const firstFactors: SignInMethod[] = [
  { id: 'password', stage: 'first', strategy: 'password' },
  { id: 'email_code', stage: 'first', strategy: 'email_code', emailAddressId: 'idn_1', identifier: 'j***@acme.com' },
];

const secondFactors: SignInMethod[] = [
  { id: 'totp', stage: 'second', strategy: 'totp' },
  { id: 'backup_code', stage: 'second', strategy: 'backup_code' },
];

const emptySignUp: SignUpDetails = { firstName: '', lastName: '', emailAddress: '', password: '' };

type Outcome = { kind: 'signed-in' } | { kind: 'signed-up' } | { kind: 'redirect'; provider: string };

function WorkingExample({ onComplete }: { onComplete: (outcome: Outcome) => void }): JSX.Element {
  const [step, setStep] = useState<SignInStep>('start');
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [identifier, setIdentifier] = useState('');
  const [value, setValue] = useState('');
  const valueRef = useRef(value);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [pendingProviderId, setPendingProviderId] = useState<string>();
  const [pendingMethodId, setPendingMethodId] = useState<string>();
  const [methodId, setMethodId] = useState('password');
  const [canResend, setCanResend] = useState(true);
  const [signUpDetails, setSignUpDetails] = useState<SignUpDetails>(emptySignUp);
  const [signUpErrors, setSignUpErrors] = useState<Partial<Record<keyof SignUpDetails, string>>>();
  const [supportRequested, setSupportRequested] = useState(false);
  const stageRef = useRef<'first' | 'second'>('first');
  const pickerReturnRef = useRef<SignInStep>('password');

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
        navigate('sign-up', 1);
        return;
      }
      stageRef.current = 'first';
      setMethodId('password');
      navigate('password', 1);
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
      stageRef.current = 'second';
      setMethodId('totp');
      navigate('totp', 1);
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
      navigate('verify-email', 1);
    });

  const onSubmit = () => {
    switch (step) {
      case 'start':
        void submitStart();
        return;
      case 'password':
        void submitPassword();
        return;
      case 'email-code':
        void submitCode(() => {
          stageRef.current = 'second';
          setMethodId('totp');
          navigate('totp', 1);
        });
        return;
      case 'totp':
        void submitCode(() => onComplete({ kind: 'signed-in' }));
        return;
      case 'backup-code':
        void submitBackupCode();
        return;
      case 'sign-up':
        void submitSignUp();
        return;
      case 'verify-email':
        void submitCode(() => onComplete({ kind: 'signed-up' }));
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

  const stepFor = (id: string): SignInStep => {
    if (id === 'email_code') {
      return 'email-code';
    }
    if (id === 'backup_code') {
      return 'backup-code';
    }
    if (id === 'totp') {
      return 'totp';
    }
    return 'password';
  };

  const onSelectMethod = (id: string) => {
    void (async () => {
      setPendingMethodId(id);
      await settleAfter(700);
      setPendingMethodId(undefined);
      setMethodId(id);
      navigate(stepFor(id), 1);
    })();
  };

  const onShowMethods = () => {
    pickerReturnRef.current = step;
    navigate('method-picker', 1);
  };

  const onBack = () => {
    if (step === 'help') {
      navigate('method-picker', -1);
      return;
    }
    if (step === 'method-picker') {
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

  const stageMethods = stageRef.current === 'first' ? firstFactors : secondFactors;
  const otpChannel = step === 'email-code' || step === 'verify-email' ? 'email' : step === 'totp' ? 'totp' : undefined;

  return (
    <>
      <Card.Root>
        <SignInView
          step={step}
          direction={direction}
          applicationName={APPLICATION_NAME}
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
            stageRef.current = 'first';
            navigate('start', -1);
          }}
          value={value}
          onValueChange={onValueChange}
          errorMessage={errorMessage}
          isPending={isPending}
          onSubmit={onSubmit}
          onForgotPassword={onShowMethods}
          onShowMethods={onShowMethods}
          onShowHelp={() => navigate('help', 1)}
          onBack={onBack}
          onEmailSupport={() => setSupportRequested(true)}
          methods={stageMethods.filter(method => method.id !== methodId)}
          pendingMethodId={pendingMethodId}
          onSelectMethod={onSelectMethod}
          otpChannel={otpChannel}
          onResend={onResend}
          canResend={canResend}
          signUpDetails={signUpDetails}
          signUpErrors={signUpErrors}
          onSignUpDetailChange={(field, next) => {
            setSignUpDetails(current => ({ ...current, [field]: next }));
            setSignUpErrors(current => (current ? { ...current, [field]: undefined } : current));
          }}
        />
      </Card.Root>
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

export function Default(): JSX.Element {
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
  identifier = 'jane@acme.com',
  errorMessage,
  isPending = false,
  pendingProviderId,
  providers = socialProviders,
  stage = 'first',
}: {
  step: SignInStep;
  combined?: boolean;
  identifier?: string;
  errorMessage?: string;
  isPending?: boolean;
  pendingProviderId?: string;
  providers?: SignInSocialProvider[];
  stage?: 'first' | 'second';
}): JSX.Element {
  const [value, setValue] = useState(errorMessage && step !== 'start' ? 'incorrect' : '');
  const [details, setDetails] = useState<SignUpDetails>({ ...emptySignUp, emailAddress: 'new@acme.com' });
  const methods = stage === 'first' ? firstFactors.slice(1) : secondFactors.slice(1);

  return (
    <Card.Root>
      <SignInView
        step={step}
        applicationName={APPLICATION_NAME}
        combined={combined}
        socialProviders={providers}
        pendingProviderId={pendingProviderId}
        onSelectProvider={() => undefined}
        identifier={step === 'start' ? value : identifier}
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
        methods={methods}
        onSelectMethod={() => undefined}
        otpChannel={step === 'email-code' || step === 'verify-email' ? 'email' : step === 'totp' ? 'totp' : undefined}
        onResend={() => undefined}
        canResend
        signUpDetails={details}
        onSignUpDetailChange={(field, next) => setDetails(current => ({ ...current, [field]: next }))}
      />
    </Card.Root>
  );
}

export function Start(): JSX.Element {
  return <StepPanel step='start' />;
}

export function StartSignInOnly(): JSX.Element {
  return (
    <StepPanel
      step='start'
      combined={false}
    />
  );
}

export function StartManyProviders(): JSX.Element {
  return (
    <StepPanel
      step='start'
      providers={[
        ...socialProviders,
        { id: 'oauth_apple', name: 'Apple', iconUrl: 'https://img.clerk.com/static/apple.svg' },
        { id: 'oauth_microsoft', name: 'Microsoft', iconUrl: 'https://img.clerk.com/static/microsoft.svg' },
      ]}
    />
  );
}

export function StartProviderPending(): JSX.Element {
  return (
    <StepPanel
      step='start'
      pendingProviderId='oauth_google'
    />
  );
}

export function StartError(): JSX.Element {
  return (
    <StepPanel
      step='start'
      errorMessage='Enter a valid email address.'
    />
  );
}

export function Password(): JSX.Element {
  return <StepPanel step='password' />;
}

export function PasswordPending(): JSX.Element {
  return (
    <StepPanel
      step='password'
      isPending
    />
  );
}

export function PasswordError(): JSX.Element {
  return (
    <StepPanel
      step='password'
      errorMessage='Password is incorrect. Try again, or use another method.'
    />
  );
}

export function EmailCode(): JSX.Element {
  return <StepPanel step='email-code' />;
}

export function Totp(): JSX.Element {
  return (
    <StepPanel
      step='totp'
      stage='second'
    />
  );
}

export function BackupCode(): JSX.Element {
  return (
    <StepPanel
      step='backup-code'
      stage='second'
    />
  );
}

export function MethodPicker(): JSX.Element {
  return <StepPanel step='method-picker' />;
}

export function SignUp(): JSX.Element {
  return <StepPanel step='sign-up' />;
}

export function VerifyEmail(): JSX.Element {
  return <StepPanel step='verify-email' />;
}
