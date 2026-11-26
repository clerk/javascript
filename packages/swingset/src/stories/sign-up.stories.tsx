import { FormSubmitError, useForm } from '@clerk/mosaic/components/form';
import { isCompletePhoneNumber } from '@clerk/mosaic/components/phone-input';
import type { SignInProvider } from '@clerk/mosaic/features/sign-in';
import type { SignUpStep, SignUpValues } from '@clerk/mosaic/features/sign-up';
import { SignUpView } from '@clerk/mosaic/features/sign-up';
import { useContext, useEffect, useRef, useState } from 'react';

import { useTestTurnstile } from '@/lib/test-turnstile';
import type { StoryMeta } from '@/lib/types';

export { default as __source } from './sign-up.stories?raw';

import type { AuthConfig } from './fixtures/auth-config';
import {
  APPLICATION_LOGO_URL,
  AuthConfigContext,
  hasFinishStep,
  LEGAL_CONSENT,
  logoUrlFor,
  passwordRulesFor,
  providersFor,
  signUpFinishErrors,
  signUpFinishFields,
} from './fixtures/auth-config';
export const meta: StoryMeta = {
  group: 'Authentication',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'SignUp',
  label: 'Sign up',
  source: 'packages/mosaic/src/features/sign-up/sign-up.view.tsx',
};

const APPLICATION_NAME = 'Acme';
const EMAIL = 'new@acme.com';

const socialProviders: SignInProvider[] = [
  { id: 'oauth_google', name: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' },
  { id: 'oauth_github', name: 'GitHub', iconUrl: 'https://img.clerk.com/static/github.svg' },
];

const whatsApp: SignInProvider = {
  id: 'whatsapp',
  name: 'WhatsApp',
  iconUrl: 'https://img.clerk.com/static/whatsapp.svg',
};

const emptyValues: SignUpValues = {
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

const startStep: SignUpStep = {
  kind: 'details',
  purpose: 'start',
  fields: {
    firstName: { required: true },
    lastName: { required: true },
    emailAddress: { required: true },
    password: { required: true },
  },
};

const legalConsent = { termsUrl: 'https://acme.com/terms', privacyPolicyUrl: 'https://acme.com/privacy' };

function StepPanel({
  step,
  providers = socialProviders,
  identifier = '',
  isPending = false,
  pendingProviderId,
  globalErrorMessage,
  onSwitchField,
  onCancel,
  onEmailSupport,
  onJoinWaitlist,
  onRetry,
  resend = false,
}: {
  step: SignUpStep;
  providers?: SignInProvider[];
  identifier?: string;
  isPending?: boolean;
  pendingProviderId?: string;
  globalErrorMessage?: string;
  onSwitchField?: () => void;
  onCancel?: () => void;
  onEmailSupport?: () => void;
  onJoinWaitlist?: () => void;
  onRetry?: () => void;
  resend?: boolean;
}) {
  const form = useForm<SignUpValues>({
    initialValues: { ...emptyValues, identifier },
    onSubmit: () => Promise.resolve(),
  });

  return (
    <SignUpView
      step={step}
      applicationName={APPLICATION_NAME}
      applicationLogoUrl={APPLICATION_LOGO_URL}
      socialProviders={providers}
      pendingProviderId={pendingProviderId}
      onSelectProvider={() => undefined}
      form={form}
      onSubmit={event => event?.preventDefault()}
      onCodeComplete={code => form.setValue('code', code)}
      isPending={isPending}
      isDisabled={isPending || Boolean(pendingProviderId)}
      globalErrorMessage={globalErrorMessage}
      onSwitchField={onSwitchField}
      onSignIn={() => undefined}
      onEditIdentifier={() => undefined}
      onCancel={onCancel}
      onBack={() => undefined}
      onEmailSupport={onEmailSupport}
      onJoinWaitlist={onJoinWaitlist}
      onResend={resend ? () => undefined : undefined}
      canResend
      onRetry={onRetry}
      passwordRules={passwordRulesFor(form.values.password)}
    />
  );
}

type Stage = { kind: 'start' } | { kind: 'verify'; identifier: string } | { kind: 'finish' };
type Channel = 'emailAddress' | 'phoneNumber';

const START: Stage = { kind: 'start' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function Default() {
  return <WorkingExample />;
}

export function WorkingExample({ onComplete }: { onComplete?: () => void }) {
  const config = useContext(AuthConfigContext);
  const finishing = hasFinishStep(config);
  const consentOnStart = config.legalConsent && !finishing;
  const [stage, setStage] = useState<Stage>(START);
  const [channel, setChannel] = useState<Channel>(config.identifier === 'phone' ? 'phoneNumber' : 'emailAddress');
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedCode, setFailedCode] = useState<string>();
  const stageRef = useRef<Stage>(START);

  const navigate = (next: Stage, nextDirection: -1 | 1) => {
    stageRef.current = next;
    setFailedCode(undefined);
    setDirection(nextDirection);
    setStage(next);
  };

  const form = useForm<SignUpValues, Stage>({
    initialValues: emptyValues,
    onSubmit: async submitted => {
      if (stageRef.current.kind === 'start') {
        const identifier = (channel === 'phoneNumber' ? submitted.phoneNumber : submitted.identifier).trim();
        const fields: Partial<Record<keyof SignUpValues, string>> = {};
        if (channel === 'emailAddress' && !EMAIL_PATTERN.test(identifier)) {
          fields.identifier = 'Enter a valid email address.';
        }
        if (config.identifier === 'username' && submitted.username.trim().length < 4) {
          fields.username = 'Use at least 4 characters for your username.';
        }
        if (channel === 'phoneNumber' && !isCompletePhoneNumber(identifier)) {
          fields.phoneNumber = 'This number looks incomplete. Enter the full number, including the area code.';
        }
        if (consentOnStart && !submitted.legalAccepted) {
          fields.legalAccepted = 'Accept the Terms and Privacy Policy to continue.';
        }
        if (Object.keys(fields).length > 0) {
          throw new FormSubmitError<SignUpValues>({ fields });
        }
        await settleAfter(700);
        return { kind: 'verify', identifier };
      }
      const fields = signUpFinishErrors(submitted, config);
      if (fields) {
        throw new FormSubmitError<SignUpValues>({ fields });
      }
      await settleAfter(700);
      return START;
    },
    onSuccess: next => {
      if (next.kind === 'start' && onComplete) {
        onComplete();
        return;
      }
      if (next.kind === 'start') {
        form.reset();
      }
      navigate(next, next.kind === 'start' ? -1 : 1);
    },
  });

  const afterVerified = () => {
    form.setValue('code', '');
    if (finishing) {
      navigate({ kind: 'finish' }, 1);
      return;
    }
    if (onComplete) {
      onComplete();
      return;
    }
    form.reset();
    navigate(START, -1);
  };

  const onCodeComplete = (code: string) => {
    form.setValue('code', code);
    void (async () => {
      setIsVerifying(true);
      setFailedCode(undefined);
      await settleAfter(700);
      setIsVerifying(false);
      if (code !== '123456') {
        setFailedCode(code);
        return;
      }
      afterVerified();
    })();
  };

  const linkPending = stage.kind === 'verify' && channel === 'emailAddress' && config.verification === 'link';
  useEffect(() => {
    if (!linkPending) {
      return;
    }
    const timer = setTimeout(afterVerified, 3_000);
    return () => clearTimeout(timer);
  });

  const codeError =
    failedCode !== undefined && form.values.code === failedCode ? 'Incorrect code. Try again.' : undefined;
  const step = signUpStepFor(stage, channel, config, consentOnStart);
  const toStart = () => navigate(START, -1);

  return (
    <SignUpView
      step={step}
      direction={direction}
      applicationName={APPLICATION_NAME}
      applicationLogoUrl={logoUrlFor(config)}
      socialProviders={providersFor(config)}
      onSelectProvider={() => undefined}
      form={form}
      onSubmit={event => form.handleSubmit(event ?? { preventDefault: () => undefined })}
      onCodeComplete={onCodeComplete}
      isPending={isVerifying || form.isSubmitting}
      isDisabled={isVerifying || form.isSubmitting}
      errorMessage={codeError}
      onSwitchField={
        config.identifier === 'email-or-phone'
          ? () => setChannel(current => (current === 'emailAddress' ? 'phoneNumber' : 'emailAddress'))
          : undefined
      }
      onSignIn={() => undefined}
      onEditIdentifier={toStart}
      onBack={toStart}
      onResend={() => undefined}
      canResend
      onEmailSupport={() => undefined}
      onJoinWaitlist={() => undefined}
      passwordRules={passwordRulesFor(form.values.password, config.passwordPolicy)}
    />
  );
}

function signUpStepFor(stage: Stage, channel: Channel, config: AuthConfig, consentOnStart: boolean): SignUpStep {
  if (config.mode !== 'public') {
    return { kind: 'notice', purpose: config.mode };
  }
  if (stage.kind === 'finish') {
    return {
      kind: 'details',
      purpose: 'continue',
      fields: signUpFinishFields(config),
      legalConsent: config.legalConsent ? LEGAL_CONSENT : undefined,
    };
  }
  if (stage.kind === 'verify') {
    if (channel === 'phoneNumber') {
      return { kind: 'code', purpose: 'verify-phone', identifier: stage.identifier };
    }
    return config.verification === 'link'
      ? { kind: 'notice', purpose: 'verify-email-link', identifier: stage.identifier }
      : { kind: 'code', purpose: 'verify-email', identifier: stage.identifier };
  }
  return {
    kind: 'details',
    purpose: 'start',
    fields:
      config.identifier === 'username'
        ? { username: { required: true }, [channel]: { required: true } }
        : { [channel]: { required: true } },
    nextField:
      config.identifier === 'email-or-phone'
        ? channel === 'emailAddress'
          ? 'phoneNumber'
          : 'emailAddress'
        : undefined,
    legalConsent: consentOnStart ? LEGAL_CONSENT : undefined,
  };
}

export function AllFieldsAtOnce() {
  return <StepPanel step={startStep} />;
}

export function StartSocialOnly() {
  return <StepPanel step={{ kind: 'details', purpose: 'start', fields: {} }} />;
}

export function StartFormOnly() {
  return (
    <StepPanel
      step={startStep}
      providers={[]}
    />
  );
}

export function StartInvitation() {
  return (
    <StepPanel
      providers={[]}
      identifier='invited@acme.com'
      step={{
        kind: 'details',
        purpose: 'start',
        fields: {
          firstName: { required: true },
          lastName: { required: true },
          emailAddress: { required: true, disabled: true },
          password: { required: true },
        },
      }}
    />
  );
}

export function StartEmailOrPhone() {
  const [active, setActive] = useState<'emailAddress' | 'phoneNumber'>('emailAddress');

  return (
    <StepPanel
      providers={[]}
      step={{
        kind: 'details',
        purpose: 'start',
        fields: { [active]: { required: true }, password: { required: true } },
        nextField: active === 'emailAddress' ? 'phoneNumber' : 'emailAddress',
      }}
      onSwitchField={() => setActive(current => (current === 'emailAddress' ? 'phoneNumber' : 'emailAddress'))}
    />
  );
}

export function StartLegalConsent() {
  return (
    <StepPanel
      providers={[]}
      identifier={EMAIL}
      step={{
        kind: 'details',
        purpose: 'start',
        fields: { emailAddress: { required: true }, password: { required: true } },
        legalConsent,
      }}
    />
  );
}

export function StartCaptcha() {
  const ref = useRef<HTMLDivElement>(null);
  useTestTurnstile(() => ref.current?.querySelector<HTMLElement>('.cl-captcha'));
  return (
    <div ref={ref}>
      <StepPanel step={startStep} />
    </div>
  );
}

export function StartProviderPending() {
  return (
    <StepPanel
      step={startStep}
      pendingProviderId='oauth_google'
    />
  );
}

export function Continue() {
  return (
    <StepPanel
      providers={[]}
      step={{
        kind: 'details',
        purpose: 'continue',
        fields: { username: { required: true }, phoneNumber: { required: true }, password: { required: true } },
      }}
    />
  );
}

export function ContinueLegalConsentOnly() {
  return <StepPanel step={{ kind: 'details', purpose: 'continue', fields: {}, legalConsent }} />;
}

export function ContinueNoFields() {
  return (
    <StepPanel
      providers={[]}
      step={{ kind: 'details', purpose: 'continue', fields: {} }}
    />
  );
}

export function Restricted() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'restricted' }}
      onEmailSupport={() => undefined}
    />
  );
}

export function Waitlist() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'waitlist' }}
      onJoinWaitlist={() => undefined}
    />
  );
}

export function AlternativePhone() {
  return (
    <StepPanel
      step={{ kind: 'alternative-phone', channel: whatsApp }}
      onCancel={() => undefined}
    />
  );
}

export function AlternativePhoneLegalConsent() {
  return (
    <StepPanel
      step={{ kind: 'alternative-phone', channel: whatsApp, legalConsent }}
      onCancel={() => undefined}
    />
  );
}

export function VerifyEmail() {
  return (
    <StepPanel
      step={{ kind: 'code', purpose: 'verify-email', identifier: EMAIL }}
      resend
    />
  );
}

export function VerifyPhone() {
  return (
    <StepPanel
      step={{ kind: 'code', purpose: 'verify-phone', identifier: '+1 555 555 0123' }}
      resend
    />
  );
}

export function VerifyPhoneAlternativeChannel() {
  return (
    <StepPanel
      step={{ kind: 'code', purpose: 'verify-phone', identifier: '+1 555 555 0123', provider: 'WhatsApp' }}
      onCancel={() => undefined}
      resend
    />
  );
}

export function VerifyEmailLink() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'verify-email-link', identifier: EMAIL }}
      resend
    />
  );
}

export function EmailLinkSignedUp() {
  return <StepPanel step={{ kind: 'notice', purpose: 'email-link-status', status: 'signed-in' }} />;
}

export function EnterpriseConnections() {
  return (
    <StepPanel
      step={{
        kind: 'choice',
        purpose: 'enterprise-connections',
        options: [
          { id: 'acme-okta', name: 'Acme Okta', iconUrl: 'https://img.clerk.com/static/okta.svg' },
          { id: 'acme-google', name: 'Acme Google Workspace', iconUrl: 'https://img.clerk.com/static/google.svg' },
        ],
      }}
    />
  );
}

export function Wallets() {
  return (
    <StepPanel
      step={{
        kind: 'choice',
        purpose: 'wallets',
        options: [
          { id: 'phantom', name: 'Phantom', iconUrl: 'https://img.clerk.com/static/phantom.svg' },
          { id: 'metamask', name: 'MetaMask', iconUrl: 'https://img.clerk.com/static/metamask.svg' },
        ],
      }}
    />
  );
}

export function WalletsSingle() {
  return (
    <StepPanel
      step={{
        kind: 'choice',
        purpose: 'wallets',
        options: [{ id: 'phantom', name: 'Phantom', iconUrl: 'https://img.clerk.com/static/phantom.svg' }],
      }}
    />
  );
}

export function Loading() {
  return <StepPanel step={{ kind: 'notice', purpose: 'loading' }} />;
}

export function ProtectCheck() {
  return (
    <StepPanel
      step={{ kind: 'notice', purpose: 'protect-check', challenge: false }}
      isPending
    />
  );
}

export function ActionBlocked() {
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
