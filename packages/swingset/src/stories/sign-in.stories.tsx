import { Button } from '@clerk/mosaic/components/button';
import type { FieldFeedback } from '@clerk/mosaic/components/form';
import { FormSubmitError, useForm } from '@clerk/mosaic/components/form';
import { isCompletePhoneNumber } from '@clerk/mosaic/components/phone-input';
import type {
  SignInAccount,
  SignInFactor,
  SignInIdentifierField,
  SignInProvider,
  SignInStep,
  SignInSubmitEvent,
  SignInValues,
} from '@clerk/mosaic/features/sign-in';
import { SignInView } from '@clerk/mosaic/features/sign-in';
import type { SignUpFields } from '@clerk/mosaic/features/sign-up';
import { createContext, useContext, useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosCompany, chaosEmail } from '@/lib/chaos';
import { useTestTurnstile } from '@/lib/test-turnstile';
import type { StoryMeta } from '@/lib/types';

export { default as __source } from './sign-in.stories?raw';

import type { AuthConfig } from './fixtures/auth-config';
import {
  APPLICATION_LOGO_URL,
  AuthConfigContext,
  hasFinishStep,
  logoUrlFor,
  passwordRulesFor,
  providersFor,
  signInIdentifierFields,
  signUpFinishErrors,
  signUpFinishFields,
  WORDMARK_LOGO_URL,
} from './fixtures/auth-config';
export const meta: StoryMeta = {
  group: 'Authentication',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'SignIn',
  label: 'Sign in',
  source: 'packages/mosaic/src/features/sign-in/sign-in.view.tsx',
};

const APPLICATION_NAME = 'Acme';
const IDENTIFIER = 'jane@acme.com';
const PHONE = '+1******0123';

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const socialProviders: SignInProvider[] = [
  { id: 'oauth_google', name: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' },
  { id: 'oauth_github', name: 'GitHub', iconUrl: 'https://img.clerk.com/static/github.svg' },
];

const firstFactors: SignInFactor[] = [
  { id: 'password', stage: 'first', strategy: 'password' },
  {
    id: 'email_code',
    stage: 'first',
    strategy: 'email_code',
    emailAddressId: 'idn_1',
    identifier: 'j***@acme.com',
    primary: true,
  },
  { id: 'email_code_2', stage: 'first', strategy: 'email_code', emailAddressId: 'idn_2', identifier: 'j***@gmail.com' },
  { id: 'phone_code', stage: 'first', strategy: 'phone_code', phoneNumberId: 'idn_5', identifier: '+1******0123' },
];

const secondFactors: SignInFactor[] = [
  { id: 'totp', stage: 'second', strategy: 'totp' },
  { id: 'backup_code', stage: 'second', strategy: 'backup_code' },
];

const manyFirstFactors: SignInFactor[] = [
  { id: 'password', stage: 'first', strategy: 'password' },
  { id: 'passkey', stage: 'first', strategy: 'passkey' },
  {
    id: 'email_code',
    stage: 'first',
    strategy: 'email_code',
    emailAddressId: 'idn_1',
    identifier: 'j***@acme.com',
    primary: true,
  },
  { id: 'email_code_2', stage: 'first', strategy: 'email_code', emailAddressId: 'idn_2', identifier: 'j***@gmail.com' },
  {
    id: 'email_code_3',
    stage: 'first',
    strategy: 'email_code',
    emailAddressId: 'idn_3',
    identifier: 'j***@analytical-engines.co.uk',
  },
  { id: 'email_code_4', stage: 'first', strategy: 'email_code', emailAddressId: 'idn_4', identifier: 'j***@proton.me' },
  {
    id: 'phone_code',
    stage: 'first',
    strategy: 'phone_code',
    phoneNumberId: 'idn_5',
    identifier: '+1******0123',
    primary: true,
  },
  { id: 'phone_code_2', stage: 'first', strategy: 'phone_code', phoneNumberId: 'idn_6', identifier: '+1******4477' },
  { id: 'phone_code_3', stage: 'first', strategy: 'phone_code', phoneNumberId: 'idn_7', identifier: '+44*******900' },
  { id: 'phone_code_4', stage: 'first', strategy: 'phone_code', phoneNumberId: 'idn_8', identifier: '+49********812' },
];

const manySecondFactors: SignInFactor[] = [
  { id: 'totp', stage: 'second', strategy: 'totp' },
  { id: 'passkey_2fa', stage: 'second', strategy: 'passkey' },
  { id: 'phone_2fa', stage: 'second', strategy: 'phone_code', phoneNumberId: 'idn_5', identifier: '+1******0123' },
  { id: 'phone_2fa_2', stage: 'second', strategy: 'phone_code', phoneNumberId: 'idn_6', identifier: '+1******4477' },
  { id: 'phone_2fa_3', stage: 'second', strategy: 'phone_code', phoneNumberId: 'idn_7', identifier: '+44*******900' },
  { id: 'email_2fa', stage: 'second', strategy: 'email_code', emailAddressId: 'idn_1', identifier: 'j***@acme.com' },
  { id: 'email_2fa_2', stage: 'second', strategy: 'email_code', emailAddressId: 'idn_2', identifier: 'j***@gmail.com' },
  { id: 'backup_code', stage: 'second', strategy: 'backup_code' },
];

export const ManyMethodsContext = createContext(false);

const resetFactors: SignInFactor[] = [
  { id: 'reset_email', stage: 'first', strategy: 'reset_password_email_code', identifier: 'j***@acme.com' },
  { id: 'reset_phone', stage: 'first', strategy: 'reset_password_phone_code', identifier: PHONE },
];

const signUpDetailFields: SignUpFields = {
  firstName: { required: true },
  lastName: { required: true },
  emailAddress: { required: true },
  password: { required: true },
};

const legalConsent = { termsUrl: 'https://acme.com/terms', privacyPolicyUrl: 'https://acme.com/privacy' };

const emptyValues: SignInValues = {
  identifier: '',
  phoneNumber: '',
  password: '',
  code: '',
  backupCode: '',
  firstName: '',
  lastName: '',
  username: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
  legalAccepted: false,
};

function newPasswordErrors(values: SignInValues): Partial<Record<keyof SignInValues, string>> | undefined {
  if (values.newPassword.length < 8) {
    return { newPassword: 'Your password must contain 8 or more characters.' };
  }
  if (values.confirmPassword !== values.newPassword) {
    return { confirmPassword: 'Passwords don’t match.' };
  }
  return undefined;
}

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
    case 'email_link':
      return { kind: 'notice', purpose: 'email-link', identifier: factor.identifier };
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

function withAlternatives(step: SignInStep, factor: SignInFactor, factors: readonly SignInFactor[]): SignInStep {
  if (step.kind !== 'code' || (factor.strategy !== 'email_code' && factor.strategy !== 'phone_code')) {
    return step;
  }
  const alternatives = factors.flatMap(other =>
    other.id !== factor.id && other.strategy === factor.strategy && other.stage === factor.stage
      ? [{ id: other.id, identifier: other.identifier }]
      : [],
  );
  return alternatives.length > 0 ? { ...step, alternatives } : step;
}

function offersResend(step: SignInStep): boolean {
  return (
    (step.kind === 'code' && step.channel !== 'totp') ||
    (step.kind === 'notice' && (step.purpose === 'email-link' || step.purpose === 'verify-email-link'))
  );
}

const PASSKEY_FACTOR: SignInFactor = { id: 'passkey', stage: 'first', strategy: 'passkey' };

function withPasskeySetting(factors: SignInFactor[], config: AuthConfig): SignInFactor[] {
  const others = factors.filter(factor => factor.strategy !== 'passkey');
  return config.passkey ? [PASSKEY_FACTOR, ...others] : others;
}

type Outcome = { kind: 'signed-in' } | { kind: 'signed-up' } | { kind: 'redirect'; provider: string };

export function WorkingExample({
  onComplete,
  newAccount = false,
}: {
  onComplete: (outcome: Outcome) => void;
  newAccount?: boolean;
}) {
  const [step, setStep] = useState<SignInStep>({ kind: 'identifier' });
  const [fieldIndex, setFieldIndex] = useState(0);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [fieldError, setFieldError] = useState<{ message: string; values: string }>();
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [pendingProviderId, setPendingProviderId] = useState<string>();
  const [pendingFactorId, setPendingFactorId] = useState<string>();
  const [factorId, setFactorId] = useState('password');
  const [canResend, setCanResend] = useState(true);
  const [supportRequested, setSupportRequested] = useState(false);
  const [stage, setStage] = useState<'first' | 'second'>('first');
  const pickerReturnRef = useRef<SignInStep>({ kind: 'credential', credential: 'password', identifier: '' });
  const addressesReturnRef = useRef<SignInStep>({ kind: 'identifier' });
  const authConfig = useContext(AuthConfigContext);
  const stepKindRef = useRef<SignInStep['kind']>('identifier');
  const form = useForm<SignInValues, Outcome>({
    initialValues: emptyValues,
    onSubmit: async submitted => {
      const isSignUp = stepKindRef.current === 'sign-up';
      const fields = isSignUp ? signUpFinishErrors(submitted, authConfig) : newPasswordErrors(submitted);
      if (fields) {
        throw new FormSubmitError<SignInValues>({ fields });
      }
      if (isSignUp) {
        await settleAfter(700);
        return { kind: 'signed-up' };
      }
      await settleAfter(1_500);
      return { kind: 'signed-in' };
    },
    onSuccess: outcome => onComplete(outcome),
  });
  const { values } = form;
  const manyMethods = useContext(ManyMethodsContext);
  const firstStageFactors = withPasskeySetting(manyMethods ? manyFirstFactors : firstFactors, authConfig).filter(
    factor => authConfig.password || factor.strategy !== 'password',
  );
  const identifierFields = signInIdentifierFields(authConfig);
  const identifierField = identifierFields[fieldIndex % identifierFields.length];
  const startStep: SignInStep = {
    kind: 'identifier',
    field: identifierField,
    lastUsed: authConfig.lastUsed === 'identifier',
    password: authConfig.password && !authConfig.combined && identifierField !== 'phone',
    passwordVisible: true,
    emailFirst: authConfig.emailFirst,
    nextField: identifierFields.length > 1 ? identifierFields[(fieldIndex + 1) % identifierFields.length] : undefined,
  };
  const identifier = (identifierField === 'phone' ? values.phoneNumber : values.identifier).trim();
  const passwordStepFor = (forIdentifier: string): SignInStep => ({
    kind: 'credential',
    credential: 'password',
    identifier: forIdentifier,
    alternatives:
      authConfig.methodsLayout === 'button' ? [] : firstStageFactors.filter(factor => factor.strategy !== 'password'),
  });
  const typedValues = JSON.stringify(values);
  const errorMessage = fieldError && fieldError.values === typedValues ? fieldError.message : undefined;
  const setErrorMessage = (message: string | undefined) =>
    setFieldError(message ? { message, values: typedValues } : undefined);

  const navigate = (next: SignInStep, nextDirection: -1 | 1) => {
    stepKindRef.current = next.kind;
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
    if (!authConfig.twoStep) {
      onComplete({ kind: 'signed-in' });
      return;
    }
    setStage('second');
    setFactorId('totp');
    navigate(
      {
        kind: 'code',
        purpose: 'second-factor',
        channel: 'totp',
        methods: (manyMethods ? manySecondFactors : secondFactors).filter(factor => factor.id !== 'totp'),
      },
      1,
    );
  };

  const submitStart = () =>
    run(() => {
      const isPhone = identifierField === 'phone';
      if (!identifier) {
        setErrorMessage(
          isPhone
            ? 'Enter your phone number.'
            : identifierField === 'email-or-username'
              ? 'Enter your email address or username.'
              : 'Enter your email address.',
        );
        return;
      }
      if (identifierField === 'email' && !identifier.includes('@')) {
        setErrorMessage('Enter a valid email address.');
        return;
      }
      if (isPhone && !isCompletePhoneNumber(identifier)) {
        setErrorMessage('This number looks incomplete. Enter the full number, including the area code.');
        return;
      }
      if (authConfig.outcome === 'blocked') {
        navigate(
          {
            kind: 'notice',
            purpose: 'action-blocked',
            details: { linkUrl: 'https://acme.com/support', linkText: 'Contact support', traceId: 'trc_2x7Hq9LmP4' },
          },
          1,
        );
        return;
      }
      if (authConfig.outcome === 'no-methods') {
        navigate({ kind: 'notice', purpose: 'no-methods' }, 1);
        return;
      }
      const isNew = newAccount || (isPhone ? identifier.endsWith('0000') : identifier.toLowerCase().includes('new'));
      if (isNew && identifierField !== 'email-or-username') {
        navigate(
          isPhone
            ? { kind: 'code', purpose: 'verify-phone', channel: 'phone', identifier }
            : { kind: 'code', purpose: 'verify-email', channel: 'email', identifier },
          1,
        );
        return;
      }
      setStage('first');
      if (authConfig.password && !authConfig.combined && identifierField !== 'phone') {
        if (!values.password) {
          setErrorMessage('Enter your password.');
          return;
        }
        startSecondFactor();
        return;
      }
      if (authConfig.password) {
        setFactorId('password');
        navigate(passwordStepFor(identifier), 1);
        return;
      }
      setFactorId(isPhone ? 'phone_code' : 'email_code');
      navigate(
        isPhone
          ? { kind: 'code', purpose: 'first-factor', channel: 'phone', identifier }
          : {
              kind: 'code',
              purpose: 'first-factor',
              channel: 'email',
              identifier: identifier.includes('@') ? identifier : 'j***@acme.com',
            },
        1,
      );
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
      if (authConfig.outcome === 'compromised') {
        navigate({ kind: 'notice', purpose: 'password-compromised' }, 1);
        return;
      }
      if (values.password.toLowerCase() === 'locked') {
        navigate({ kind: 'identifier' }, -1);
        setGlobalErrorMessage('Your account is locked. Try again later or contact support.');
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
      if (code !== '123456') {
        setFieldError({ message: 'Incorrect code. Try again.', values: JSON.stringify({ ...values, code }) });
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
        case 'verify-phone':
          if (!hasFinishStep(authConfig)) {
            onComplete({ kind: 'signed-up' });
            return;
          }
          navigate(
            {
              kind: 'sign-up',
              purpose: 'continue',
              fields: signUpFinishFields(authConfig),
              legalConsent: authConfig.legalConsent ? legalConsent : undefined,
            },
            1,
          );
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

  const onSubmit = (event?: SignInSubmitEvent) => {
    if (step.kind === 'new-password' || step.kind === 'sign-up') {
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
          void run(() => onComplete({ kind: 'signed-in' }));
          return;
        }
        void (step.credential === 'password' ? submitPassword() : submitBackupCode());
        return;
      case 'code':
        void submitCode(values.code);
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

  const stageFactors = stage === 'first' ? firstStageFactors : manyMethods ? manySecondFactors : secondFactors;
  const otherFactors = stageFactors.filter(factor => factor.id !== factorId);

  const methodOptions = otherFactors.flatMap(factor => {
    if (
      authConfig.addressChoice !== 'primary' ||
      (factor.strategy !== 'email_code' && factor.strategy !== 'phone_code')
    ) {
      return [factor];
    }
    const same = otherFactors.filter(other => other.strategy === factor.strategy && other.stage === factor.stage);
    const lead = same.find(other => 'primary' in other && other.primary) ?? same[0];
    if (lead.id !== factor.id) {
      return [];
    }
    return [same.length > 1 ? { ...factor, identifier: '' } : factor];
  });

  const onSelectFactor = (id: string) => {
    const factor = stageFactors.find(candidate => candidate.id === id);
    if (!factor) {
      return;
    }
    const addresses = stageFactors.filter(candidate => candidate.strategy === factor.strategy);
    const choosingAddress = step.kind === 'choice' && step.purpose === 'addresses';
    if (!choosingAddress && addresses.length > 1 && authConfig.addressChoice === 'ask') {
      addressesReturnRef.current = step;
      navigate({ kind: 'choice', purpose: 'addresses', options: addresses }, 1);
      return;
    }
    const chosen =
      !choosingAddress && addresses.length > 1
        ? (addresses.find(candidate => 'primary' in candidate && candidate.primary) ?? factor)
        : factor;
    void (async () => {
      setPendingFactorId(chosen.id);
      await settleAfter(700);
      setPendingFactorId(undefined);
      if (chosen.strategy === 'passkey') {
        onComplete({ kind: 'signed-in' });
        return;
      }
      setFactorId(chosen.id);
      navigate(
        chosen.strategy === 'password'
          ? passwordStepFor(identifier)
          : withAlternatives(stepFor(chosen, identifier), chosen, stageFactors),
        1,
      );
    })();
  };

  const onChangeAddress = () => {
    const current = stageFactors.find(candidate => candidate.id === factorId);
    const addresses = current ? stageFactors.filter(candidate => candidate.strategy === current.strategy) : [];
    if (addresses.length < 2) {
      return;
    }
    addressesReturnRef.current = step;
    navigate({ kind: 'choice', purpose: 'addresses', options: addresses }, 1);
  };

  const onShowMethods = () => {
    pickerReturnRef.current = step;
    navigate({ kind: 'choice', purpose: 'methods', options: methodOptions }, 1);
  };

  const onBack = () => {
    if (step.kind === 'notice' && step.purpose === 'forgot-password') {
      navigate(passwordStepFor(step.identifier), -1);
      return;
    }
    if (step.kind === 'new-password' || (step.kind === 'code' && step.purpose === 'reset-password')) {
      navigate(passwordStepFor(identifier), -1);
      return;
    }
    if (step.kind === 'notice') {
      navigate({ kind: 'choice', purpose: 'methods', options: methodOptions }, -1);
      return;
    }
    if (step.kind === 'choice' && step.purpose === 'addresses') {
      navigate(addressesReturnRef.current, -1);
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
    if (current.kind === 'code' && (current.purpose === 'verify-email' || current.purpose === 'verify-phone')) {
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
        step={step.kind === 'identifier' && !('channel' in step) ? startStep : step}
        onSwitchField={identifierFields.length > 1 ? () => setFieldIndex(current => current + 1) : undefined}
        direction={direction}
        applicationName={APPLICATION_NAME}
        applicationLogoUrl={logoUrlFor(authConfig)}
        combined={authConfig.combined}
        socialProviders={providersFor(authConfig)}
        lastUsedProviderId={
          authConfig.lastUsed === 'google' && authConfig.socialProviders > 0
            ? 'oauth_google'
            : authConfig.lastUsed === 'passkey' && authConfig.passkey
              ? 'passkey'
              : undefined
        }
        onPasskey={
          authConfig.passkey
            ? () =>
                void (async () => {
                  setPendingProviderId('passkey');
                  await settleAfter(900);
                  setPendingProviderId(undefined);
                  onComplete({ kind: 'signed-in' });
                })()
            : undefined
        }
        onSignUp={authConfig.combined || authConfig.mode !== 'public' ? undefined : () => undefined}
        onJoinWaitlist={!authConfig.combined && authConfig.mode === 'waitlist' ? () => undefined : undefined}
        pendingProviderId={pendingProviderId}
        onSelectProvider={onSelectProvider}
        form={form}
        onSubmit={onSubmit}
        onCodeComplete={code => {
          form.setValue('code', code);
          void submitCode(code);
        }}
        isPending={isPending || form.isSubmitting}
        isDisabled={isPending || form.isSubmitting || Boolean(pendingProviderId) || Boolean(pendingFactorId)}
        errorMessage={errorMessage}
        globalErrorMessage={globalErrorMessage}
        newPasswordRules={
          step.kind === 'sign-up'
            ? passwordRulesFor(values.password, authConfig.passwordPolicy)
            : step.kind === 'new-password'
              ? passwordRulesFor(values.newPassword)
              : undefined
        }
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
        onForgotPassword={() => navigate({ kind: 'code', purpose: 'reset-password', channel: 'email', identifier }, 1)}
        onCancel={cancelFor(step)}
        onShowHelp={() => navigate({ kind: 'notice', purpose: 'help' }, 1)}
        onBack={onBack}
        onStartOver={() => navigate({ kind: 'identifier' }, -1)}
        onEmailSupport={() => setSupportRequested(true)}
        pendingFactorId={pendingFactorId}
        onSelectFactor={onSelectFactor}
        onChangeAddress={authConfig.addressChoice === 'primary' ? onChangeAddress : undefined}
        onSelectAccount={() => undefined}
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
    <div className='min-h-136 grid w-full grid-cols-[minmax(0,1fr)] place-items-center'>
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
  tryCode = false,
  globalErrorMessage,
  isPending = false,
  pendingProviderId,
  providers = socialProviders,
  identifier,
  otherMethods = true,
  onSwitchField,
  onPasskey,
  onSelectProvider,
  onCancel,
  lastUsedProviderId,
  onJoinWaitlist,
  passwordFeedback,
  onRetry,
  password,
  logoUrl = APPLICATION_LOGO_URL,
}: {
  step: SignInStep;
  combined?: boolean;
  errorMessage?: string;
  tryCode?: boolean;
  globalErrorMessage?: string;
  isPending?: boolean;
  pendingProviderId?: string;
  providers?: SignInProvider[];
  identifier?: string;
  otherMethods?: boolean;
  onSwitchField?: () => void;
  onPasskey?: () => void;
  onSelectProvider?: (id: string) => void;
  onCancel?: () => void;
  lastUsedProviderId?: string;
  onJoinWaitlist?: () => void;
  passwordFeedback?: FieldFeedback;
  onRetry?: () => void;
  password?: string;
  logoUrl?: string | null;
}) {
  const fixture = useChaosFixture({ applicationName: APPLICATION_NAME, email: IDENTIFIER, step }, data => ({
    applicationName: chaosCompany(0),
    email: chaosEmail(0),
    step:
      'identifier' in data.step && typeof data.step.identifier === 'string' && data.step.identifier.includes('@')
        ? { ...data.step, identifier: chaosEmail(0) }
        : data.step,
  }));
  const attempted = errorMessage && step.kind !== 'identifier' ? 'incorrect' : '';
  const form = useForm<SignInValues>({
    initialValues: {
      ...emptyValues,
      identifier:
        identifier ?? (step.kind === 'sign-up' ? 'new@acme.com' : step.kind === 'identifier' ? '' : fixture.email),
      password: password ?? attempted,
      backupCode: attempted,
    },
    onSubmit: () => Promise.resolve(),
  });

  const [failedCode, setFailedCode] = useState<string>();
  const enteredCode = form.values.code;
  const codeError =
    failedCode !== undefined && (enteredCode === failedCode || enteredCode === '')
      ? 'That code didn’t work. Try again.'
      : undefined;

  return (
    <SignInView
      step={fixture.step}
      applicationName={fixture.applicationName}
      applicationLogoUrl={logoUrl ?? undefined}
      combined={combined}
      socialProviders={providers}
      pendingProviderId={pendingProviderId}
      lastUsedProviderId={lastUsedProviderId}
      onSelectProvider={onSelectProvider ?? (() => undefined)}
      onSwitchField={onSwitchField}
      onPasskey={onPasskey}
      form={form}
      onSubmit={event => event?.preventDefault()}
      onCodeComplete={code => {
        form.setValue('code', code);
        if (tryCode) {
          setFailedCode(code === TRY_CODE ? undefined : code);
        }
      }}
      isPending={isPending}
      isDisabled={isPending || Boolean(pendingProviderId)}
      errorMessage={codeError ?? errorMessage}
      globalErrorMessage={globalErrorMessage}
      newPasswordFeedback={passwordFeedback}
      onEditIdentifier={() => undefined}
      onSignUp={combined ? undefined : () => undefined}
      onJoinWaitlist={onJoinWaitlist}
      onSelectAccount={() => undefined}
      onAddAccount={() => undefined}
      onSignOutAll={() => undefined}
      onForgotPassword={() => undefined}
      onCancel={
        onCancel ??
        (!otherMethods || (step.kind === 'code' && step.purpose === 'verify-email') ? undefined : () => undefined)
      }
      onShowHelp={() => undefined}
      onBack={() => undefined}
      onStartOver={() => undefined}
      onRetry={onRetry}
      onEmailSupport={() => undefined}
      onSelectFactor={() => undefined}
      onResend={offersResend(step) ? () => undefined : undefined}
      canResend
    />
  );
}

const passwordStep: SignInStep = {
  kind: 'credential',
  credential: 'password',
  identifier: IDENTIFIER,
  alternatives: [{ id: 'passkey', stage: 'first', strategy: 'passkey' }, ...firstFactors.slice(1)],
};
const identifierStep: SignInStep = { kind: 'identifier', field: 'email' };

export function IdentifierWordmarkLogo() {
  return (
    <StepPanel
      step={identifierStep}
      logoUrl={WORDMARK_LOGO_URL}
    />
  );
}

export function IdentifierNoLogo() {
  return (
    <StepPanel
      step={identifierStep}
      logoUrl={null}
    />
  );
}

export function IdentifierDefault() {
  return <StepPanel step={{ kind: 'identifier', field: 'email' }} />;
}

export function IdentifierSignInOnly() {
  return (
    <StepPanel
      step={{ kind: 'identifier', field: 'email' }}
      combined={false}
    />
  );
}

export function IdentifierManyProviders() {
  return (
    <StepPanel
      step={{ kind: 'identifier', field: 'email' }}
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
      step={{ kind: 'identifier', field: 'email' }}
      pendingProviderId='oauth_google'
    />
  );
}

export function IdentifierError() {
  return (
    <StepPanel
      step={{ kind: 'identifier', field: 'email' }}
      errorMessage='Enter a valid email address.'
    />
  );
}

export function IdentifierLocked() {
  return (
    <StepPanel
      step={{ kind: 'identifier', field: 'email' }}
      combined={false}
      identifier={IDENTIFIER}
      globalErrorMessage='Your account is locked. Try again later or contact support.'
    />
  );
}

function SwitchingIdentifier({ fields }: { fields: readonly SignInIdentifierField[] }) {
  const [index, setIndex] = useState(0);
  const next = fields.length > 1 ? fields[(index + 1) % fields.length] : undefined;
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier', field: fields[index], nextField: next }}
      onSwitchField={() => setIndex(current => (current + 1) % fields.length)}
    />
  );
}

export function IdentifierPhone() {
  return <SwitchingIdentifier fields={['phone', 'email']} />;
}

export function IdentifierUsername() {
  return <SwitchingIdentifier fields={['username']} />;
}

export function IdentifierWeb3() {
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier', field: 'email' }}
      providers={[
        { id: 'oauth_google', name: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' },
        { id: 'web3_metamask_signature', name: 'MetaMask', iconUrl: 'https://img.clerk.com/static/metamask.svg' },
        {
          id: 'web3_coinbase_wallet_signature',
          name: 'Coinbase Wallet',
          iconUrl: 'https://img.clerk.com/static/coinbase_wallet.svg',
        },
      ]}
    />
  );
}

export function IdentifierSocialOnly() {
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier' }}
    />
  );
}

export function IdentifierPassword() {
  return (
    <StepPanel
      combined={false}
      providers={[]}
      identifier={IDENTIFIER}
      password='correct-horse-9'
      step={{ kind: 'identifier', field: 'email', password: true }}
    />
  );
}

export function IdentifierPasskey() {
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier', field: 'email' }}
      onPasskey={() => undefined}
    />
  );
}

const emailFirstCss = `
.email-first .cl-sign-in-divider { order: 1; }
.email-first .cl-sign-in-providers { order: 2; }
.email-first .cl-provider-button-group-row { display: grid !important; grid-template-columns: minmax(0, 1fr) !important; }
.email-first .cl-provider-button-long-label { display: block !important; }
.email-first .cl-provider-button-short-label { display: none !important; }
`;

export function IdentifierEmailFirst() {
  return (
    <div className='email-first'>
      <style>{emailFirstCss}</style>
      <StepPanel
        combined={false}
        step={{ kind: 'identifier', field: 'email' }}
        providers={[
          ...socialProviders,
          { id: 'oauth_apple', name: 'Apple', iconUrl: 'https://img.clerk.com/static/apple.svg' },
        ]}
        onPasskey={() => undefined}
      />
    </div>
  );
}

const TRY_CODE = '123456';

export function CodeEmailTryIt() {
  return (
    <StepPanel
      step={{ kind: 'code', purpose: 'first-factor', channel: 'email', identifier: IDENTIFIER }}
      tryCode
    />
  );
}

export function IdentifierPasskeyOnly() {
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier', field: 'email' }}
      providers={[]}
      onPasskey={() => undefined}
    />
  );
}

export function IdentifierPasskeyLastUsed() {
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier', field: 'email' }}
      lastUsedProviderId='passkey'
      onPasskey={() => undefined}
    />
  );
}

export function IdentifierPasskeyPending() {
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier', field: 'email' }}
      pendingProviderId='passkey'
      onPasskey={() => undefined}
    />
  );
}

const whatsApp: SignInProvider = {
  id: 'whatsapp',
  name: 'WhatsApp',
  iconUrl: 'https://img.clerk.com/static/whatsapp.svg',
};

export function IdentifierAlternativePhoneChannel() {
  const [step, setStep] = useState<SignInStep>({ kind: 'identifier', field: 'phone', channel: whatsApp });
  return (
    <StepPanel
      combined={false}
      step={step}
      providers={[...socialProviders, whatsApp]}
      onSelectProvider={id => {
        if (id === whatsApp.id) {
          setStep({ kind: 'identifier', field: 'phone', channel: whatsApp });
        }
      }}
      onCancel={() => setStep({ kind: 'identifier', field: 'email' })}
    />
  );
}

export function IdentifierLastUsed() {
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier', field: 'email' }}
      providers={[...socialProviders, { id: 'oauth_x', name: 'X', iconUrl: 'https://img.clerk.com/static/x.svg' }]}
      lastUsedProviderId='oauth_github'
    />
  );
}

export function IdentifierLastUsedField() {
  return (
    <StepPanel
      combined={false}
      step={{ kind: 'identifier', field: 'email', lastUsed: true }}
    />
  );
}

export function IdentifierCaptcha() {
  const ref = useRef<HTMLDivElement>(null);
  useTestTurnstile(() => ref.current?.querySelector<HTMLElement>('.cl-captcha'));
  return (
    <div ref={ref}>
      <StepPanel
        combined={false}
        step={{ kind: 'identifier', field: 'email' }}
      />
    </div>
  );
}

export function IdentifierWaitlist() {
  return (
    <StepPanel
      step={{ kind: 'identifier', field: 'email' }}
      combined={false}
      onJoinWaitlist={() => undefined}
    />
  );
}

export function IdentifierEmailOrUsername() {
  return <SwitchingIdentifier fields={['email-or-username', 'phone']} />;
}

export function IdentifierBannerError() {
  return (
    <StepPanel
      step={{ kind: 'identifier', field: 'email' }}
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

export function CodePhone() {
  return <StepPanel step={{ kind: 'code', purpose: 'first-factor', channel: 'phone', identifier: PHONE }} />;
}

export function CodeAlternativePhoneChannel() {
  return (
    <StepPanel
      step={{ kind: 'code', purpose: 'first-factor', channel: 'phone', identifier: PHONE, provider: 'WhatsApp' }}
    />
  );
}

export function CodeSecondFactorPhone() {
  return <StepPanel step={{ kind: 'code', purpose: 'second-factor', channel: 'phone', identifier: PHONE }} />;
}

export function CodeSecondFactorEmail() {
  return (
    <StepPanel
      step={{ kind: 'code', purpose: 'second-factor', channel: 'email', identifier: IDENTIFIER }}
      otherMethods={false}
    />
  );
}

export function CodeSsoBypass() {
  return <StepPanel step={{ kind: 'code', purpose: 'sso-bypass', channel: 'email', identifier: IDENTIFIER }} />;
}

export function CodeVerifyPhone() {
  return (
    <StepPanel step={{ kind: 'code', purpose: 'verify-phone', channel: 'phone', identifier: '+1 555 555 0123' }} />
  );
}

export function NoticeEnterpriseSso() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'enterprise-sso' }}
      combined={false}
    />
  );
}

export function CodeClientTrust() {
  return <StepPanel step={{ kind: 'code', purpose: 'client-trust', channel: 'email', identifier: IDENTIFIER }} />;
}

export function CodeResetPassword() {
  return <StepPanel step={{ kind: 'code', purpose: 'reset-password', channel: 'email', identifier: IDENTIFIER }} />;
}

export function CodeResetPasswordPhone() {
  return <StepPanel step={{ kind: 'code', purpose: 'reset-password', channel: 'phone', identifier: PHONE }} />;
}

export function CodeVerifyEmail() {
  return <StepPanel step={{ kind: 'code', purpose: 'verify-email', channel: 'email', identifier: 'new@acme.com' }} />;
}

export function ChoiceMethods() {
  return (
    <StepPanel
      step={{ kind: 'choice', purpose: 'methods', options: firstFactors.slice(1) }}
      providers={[]}
    />
  );
}

export function ChoiceMethodsWithProviders() {
  return (
    <StepPanel
      step={{
        kind: 'choice',
        purpose: 'methods',
        options: [{ id: 'passkey', stage: 'first', strategy: 'passkey' }, ...firstFactors.slice(1)],
      }}
    />
  );
}

export function ChoiceEnterpriseConnections() {
  return (
    <StepPanel
      step={{
        kind: 'choice',
        purpose: 'enterprise-connections',
        options: [
          { id: 'okta', name: 'Acme Okta', iconUrl: 'https://img.clerk.com/static/okta.svg' },
          { id: 'entra', name: 'Acme Contractors (Entra ID)', iconUrl: 'https://img.clerk.com/static/microsoft.svg' },
        ],
      }}
      combined={false}
    />
  );
}

const accounts: SignInAccount[] = [
  {
    id: 'sess_1',
    name: 'Cameron Walker',
    identifier: 'cameron@acme.com',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  { id: 'sess_2', name: 'Jane Doe', identifier: 'jane@acme.com' },
];

export function ChoiceAccounts() {
  return <StepPanel step={{ kind: 'choice', purpose: 'accounts', options: accounts }} />;
}

const wallets: SignInProvider[] = [
  { id: 'phantom', name: 'Phantom', iconUrl: 'https://img.clerk.com/static/phantom.svg' },
  { id: 'metamask', name: 'MetaMask', iconUrl: 'https://img.clerk.com/static/metamask.svg' },
];

export function ChoiceMethodsEmailLink() {
  return (
    <StepPanel
      providers={[{ id: 'oauth_google', name: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' }]}
      step={{
        kind: 'choice',
        purpose: 'methods',
        options: [
          { id: 'email_link', stage: 'first', strategy: 'email_link', emailAddressId: 'idn_1', identifier: IDENTIFIER },
          { id: 'email_code', stage: 'first', strategy: 'email_code', emailAddressId: 'idn_1', identifier: IDENTIFIER },
        ],
      }}
    />
  );
}

export function ChoiceMethodsEntry() {
  return <StepPanel step={{ kind: 'choice', purpose: 'methods', canGoBack: false, options: [] }} />;
}

export function ChoiceMethodsSecondFactor() {
  return (
    <StepPanel
      providers={[]}
      step={{ kind: 'choice', purpose: 'methods', options: secondFactors }}
    />
  );
}

export function ChoiceWalletsSingle() {
  return <StepPanel step={{ kind: 'choice', purpose: 'wallets', options: wallets.slice(0, 1) }} />;
}

export function ChoiceWalletsNone() {
  return <StepPanel step={{ kind: 'choice', purpose: 'wallets', options: [] }} />;
}

export function ChoiceWalletsLoading() {
  return <StepPanel step={{ kind: 'choice', purpose: 'wallets', options: [], loading: true }} />;
}

export function ChoiceWallets() {
  return <StepPanel step={{ kind: 'choice', purpose: 'wallets', options: wallets }} />;
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

export function NoticeEmailLinkSignedInOtherTab() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'email-link-status', status: 'signed-in-other-tab', flow: 'sign-in' }}
    />
  );
}

export function NoticeEmailLinkVerified() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link-status', status: 'transferable', flow: 'sign-in' }} />;
}

export function NoticeEmailLinkSigningIn() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link-status', status: 'loading', flow: 'sign-in' }} />;
}

export function NoticeEmailLinkSignedIn() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link-status', status: 'signed-in', flow: 'sign-in' }} />;
}

export function NoticeEmailLinkExpired() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link-status', status: 'expired', flow: 'sign-in' }} />;
}

export function NoticeEmailLinkInvalid() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link-status', status: 'failed', flow: 'sign-in' }} />;
}

export function NoticeEmailLinkClientMismatch() {
  return (
    <StepPanel step={{ kind: 'notice', purpose: 'email-link-status', status: 'client-mismatch', flow: 'sign-in' }} />
  );
}

export function CredentialPasswordOnly() {
  return (
    <StepPanel
      step={passwordStep}
      otherMethods={false}
    />
  );
}

export function CredentialPasskeySecondFactor() {
  return <StepPanel step={{ kind: 'credential', credential: 'passkey' }} />;
}

export function CredentialBackupCodeResetting() {
  return (
    <StepPanel step={{ kind: 'credential', credential: 'backup-code', identifier: IDENTIFIER, resetting: true }} />
  );
}

export function CodeSecondFactorResetting() {
  return (
    <StepPanel
      step={{ kind: 'code', purpose: 'second-factor', channel: 'phone', identifier: PHONE, resetting: true }}
    />
  );
}

export function NoticeEmailLinkNewDevice() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link', identifier: IDENTIFIER, newDevice: true }} />;
}

export function CredentialPasskey() {
  return <StepPanel step={{ kind: 'credential', credential: 'passkey', identifier: IDENTIFIER }} />;
}

export function NoticeStartOver() {
  return <StepPanel step={{ kind: 'notice', purpose: 'start-over' }} />;
}

export function NoticeLoading() {
  return <StepPanel step={{ kind: 'notice', purpose: 'loading' }} />;
}

export function NoticeLoadingError() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'loading' }}
      globalErrorMessage='Unable to complete action at this time. If the problem persists please contact support.'
    />
  );
}

export function NoticeProtectCheck() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'protect-check', challenge: false }}
      isPending
    />
  );
}

export function NoticeProtectCheckChallenge() {
  const ref = useRef<HTMLDivElement>(null);
  const status = useTestTurnstile(() => ref.current?.querySelector<HTMLElement>('#clerk-protect-check'));
  return (
    <div ref={ref}>
      <StepPanel
        step={{ kind: 'notice', purpose: 'protect-check', challenge: status === 'Interactive challenge shown' }}
        isPending
      />
    </div>
  );
}

export function NoticeProtectCheckError() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'protect-check', challenge: false }}
      globalErrorMessage='Verification couldn’t start. Please contact support.'
      onRetry={() => undefined}
    />
  );
}

export function NewPasswordReset() {
  return <StepPanel step={{ kind: 'new-password', reason: 'forgot' }} />;
}

export function NewPasswordRequired() {
  return <StepPanel step={{ kind: 'new-password', reason: 'required' }} />;
}

export function SignUpDetails() {
  return <StepPanel step={{ kind: 'sign-up', fields: signUpDetailFields }} />;
}

export function SignUpSettingsFields() {
  return (
    <StepPanel
      providers={[]}
      step={{
        kind: 'sign-up',
        fields: {
          username: { required: true },
          phoneNumber: { required: true },
          password: { required: true },
        },
      }}
    />
  );
}

export function SignUpOptionalFields() {
  return (
    <StepPanel
      providers={[]}
      step={{
        kind: 'sign-up',
        fields: {
          firstName: { required: false },
          lastName: { required: false },
          emailAddress: { required: true },
          password: { required: true },
        },
      }}
    />
  );
}

export function SignUpEmailOrPhone() {
  const [active, setActive] = useState<'emailAddress' | 'phoneNumber'>('emailAddress');

  return (
    <StepPanel
      providers={[]}
      step={{
        kind: 'sign-up',
        fields: { [active]: { required: true }, password: { required: true } },
        nextField: active === 'emailAddress' ? 'phoneNumber' : 'emailAddress',
      }}
      onSwitchField={() => setActive(current => (current === 'emailAddress' ? 'phoneNumber' : 'emailAddress'))}
    />
  );
}

export function SignUpLegalConsent() {
  return (
    <StepPanel
      providers={[]}
      step={{
        kind: 'sign-up',
        fields: { emailAddress: { required: true }, password: { required: true } },
        legalConsent,
      }}
    />
  );
}

export function SignUpLegalConsentOnly() {
  return <StepPanel step={{ kind: 'sign-up', fields: {}, legalConsent }} />;
}

export function SignUpContinue() {
  return (
    <StepPanel
      providers={[]}
      step={{
        kind: 'sign-up',
        purpose: 'continue',
        fields: { username: { required: true }, emailAddress: { required: true }, password: { required: true } },
        nextField: 'phoneNumber',
      }}
      onSwitchField={() => undefined}
    />
  );
}

export function SignUpAlternativePhone() {
  return (
    <StepPanel
      step={{ kind: 'identifier', field: 'phone', channel: whatsApp, flow: 'sign-up', legalConsent }}
      onCancel={() => undefined}
    />
  );
}

export function SignUpRestricted() {
  return <StepPanel step={{ kind: 'notice', purpose: 'restricted' }} />;
}

export function SignUpWaitlist() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'waitlist' }}
      onJoinWaitlist={() => undefined}
    />
  );
}

export function SignUpPasswordRequirements() {
  return (
    <StepPanel
      providers={[]}
      step={{ kind: 'sign-up', fields: { emailAddress: { required: true }, password: { required: true } } }}
      passwordFeedback={{ type: 'info', message: 'Your password must contain 8 or more characters.' }}
    />
  );
}

export function SignUpVerifyEmailLink() {
  return <StepPanel step={{ kind: 'notice', purpose: 'verify-email-link', identifier: 'new@acme.com' }} />;
}

export function SignUpEmailLinkSignedUp() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link-status', status: 'signed-in', flow: 'sign-up' }} />;
}

export function ChoiceMethodsMany() {
  return <StepPanel step={{ kind: 'choice', purpose: 'methods', options: manyFirstFactors.slice(1) }} />;
}

export function ChoiceMethodsSecondFactorMany() {
  return (
    <StepPanel
      providers={[]}
      step={{ kind: 'choice', purpose: 'methods', options: manySecondFactors }}
    />
  );
}
