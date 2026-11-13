import { useForm } from '@clerk/mosaic/components/form';
import type { SignInProvider } from '@clerk/mosaic/features/sign-in';
import type { SignUpStep, SignUpValues } from '@clerk/mosaic/features/sign-up';
import { SignUpView } from '@clerk/mosaic/features/sign-up';
import { useRef, useState } from 'react';

import { useTestTurnstile } from '@/lib/test-turnstile';
import type { StoryMeta } from '@/lib/types';

export { default as __source } from './sign-up.stories?raw';

export const meta: StoryMeta = {
  group: 'Authentication',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'SignUp',
  label: 'Sign up',
  source: 'packages/mosaic/src/features/sign-up/sign-up.view.tsx',
};

const APPLICATION_NAME = 'Acme';
const APPLICATION_LOGO_URL = 'https://avatars.githubusercontent.com/u/49538330?v=4';
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
    />
  );
}

export function Default() {
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
