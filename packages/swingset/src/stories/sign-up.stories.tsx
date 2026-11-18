import { useForm } from '@clerk/mosaic/components/form';
import type { SignInProvider } from '@clerk/mosaic/features/sign-in';
import type {
  SignUpDetails,
  SignUpDetailsScreen,
  SignUpScreen,
  SignUpValues,
  SignUpVerifyScreen,
  SignUpViewProps,
} from '@clerk/mosaic/features/sign-up';
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
const PHONE = '+1 555 555 0123';

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
  emailAddress: '',
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

const startStep: SignUpDetails = {
  purpose: 'start',
  fields: {
    firstName: { required: true },
    lastName: { required: true },
    emailAddress: { required: true },
    password: { required: true },
  },
};

const legalConsent = { termsUrl: 'https://acme.com/terms', privacyPolicyUrl: 'https://acme.com/privacy' };

const noop = () => undefined;

function verifyScreen(identifier: string): SignUpVerifyScreen {
  return {
    identifier,
    needsCode: false,
    sendCode: () => Promise.resolve(),
    verifyCode: () => Promise.resolve({ type: 'unknown' }),
    onVerified: noop,
    isPending: false,
    onEditIdentifier: noop,
  };
}

type DetailsOverrides = Partial<Omit<SignUpDetailsScreen, 'form'>>;

type ScreenOverrides = Partial<
  Omit<SignUpViewProps, 'screen' | 'start' | 'continue' | 'alternativePhone' | 'applicationName' | 'applicationLogoUrl'>
>;

function ScreenPanel({
  screen,
  identifier = '',
  start,
  continue: continueDetails,
  alternativePhone,
  ...overrides
}: ScreenOverrides & {
  screen: SignUpScreen;
  identifier?: string;
  start?: DetailsOverrides;
  continue?: DetailsOverrides;
  alternativePhone?: Pick<NonNullable<SignUpViewProps['alternativePhone']>, 'channel' | 'legalConsent'>;
}) {
  const form = useForm<SignUpValues>({
    initialValues: { ...emptyValues, emailAddress: identifier },
    onSubmit: () => Promise.resolve(),
  });
  const details: SignUpDetailsScreen = {
    step: startStep,
    socialProviders,
    onSelectProvider: noop,
    form,
    onSubmit: event => event.preventDefault(),
    isPending: false,
    isDisabled: false,
    onSignIn: noop,
  };

  return (
    <SignUpView
      screen={screen}
      applicationName={APPLICATION_NAME}
      applicationLogoUrl={APPLICATION_LOGO_URL}
      start={{ ...details, ...start }}
      continue={{ ...details, ...continueDetails }}
      verifyEmail={verifyScreen(EMAIL)}
      verifyPhone={verifyScreen(PHONE)}
      restricted={{ onSignIn: noop }}
      onStartOver={noop}
      alternativePhone={
        alternativePhone
          ? {
              ...alternativePhone,
              form,
              onSubmit: event => event.preventDefault(),
              isPending: false,
              isDisabled: false,
              onCancel: noop,
            }
          : undefined
      }
      {...overrides}
    />
  );
}

export function Default() {
  return <ScreenPanel screen='start' />;
}

export function StartSocialOnly() {
  return (
    <ScreenPanel
      screen='start'
      start={{ step: { purpose: 'start', fields: {} } }}
    />
  );
}

export function StartFormOnly() {
  return (
    <ScreenPanel
      screen='start'
      start={{ socialProviders: [] }}
    />
  );
}

export function StartInvitation() {
  return (
    <ScreenPanel
      screen='start'
      identifier='invited@acme.com'
      start={{
        socialProviders: [],
        step: {
          purpose: 'start',
          fields: {
            firstName: { required: true },
            lastName: { required: true },
            emailAddress: { required: true, disabled: true },
            password: { required: true },
          },
        },
      }}
    />
  );
}

export function StartEmailOrPhone() {
  const [active, setActive] = useState<'emailAddress' | 'phoneNumber'>('emailAddress');

  return (
    <ScreenPanel
      screen='start'
      start={{
        socialProviders: [],
        step: {
          purpose: 'start',
          fields: { [active]: { required: true }, password: { required: true } },
          nextField: active === 'emailAddress' ? 'phoneNumber' : 'emailAddress',
        },
        onSwitchField: () => setActive(current => (current === 'emailAddress' ? 'phoneNumber' : 'emailAddress')),
      }}
    />
  );
}

export function StartLegalConsent() {
  return (
    <ScreenPanel
      screen='start'
      identifier={EMAIL}
      start={{
        socialProviders: [],
        step: {
          purpose: 'start',
          fields: { emailAddress: { required: true }, password: { required: true } },
          legalConsent,
        },
      }}
    />
  );
}

export function StartCaptcha() {
  const ref = useRef<HTMLDivElement>(null);
  useTestTurnstile(() => ref.current?.querySelector<HTMLElement>('.cl-captcha'));
  return (
    <div ref={ref}>
      <ScreenPanel screen='start' />
    </div>
  );
}

export function StartProviderPending() {
  return (
    <ScreenPanel
      screen='start'
      start={{ pendingProviderId: 'oauth_google', isDisabled: true }}
    />
  );
}

export function Continue() {
  return (
    <ScreenPanel
      screen='continue'
      continue={{
        socialProviders: [],
        step: {
          purpose: 'continue',
          fields: { username: { required: true }, phoneNumber: { required: true }, password: { required: true } },
        },
      }}
    />
  );
}

export function ContinueLegalConsentOnly() {
  return (
    <ScreenPanel
      screen='continue'
      continue={{ step: { purpose: 'continue', fields: {}, legalConsent } }}
    />
  );
}

export function ContinueNoFields() {
  return (
    <ScreenPanel
      screen='continue'
      continue={{ socialProviders: [], step: { purpose: 'continue', fields: {} } }}
    />
  );
}

export function Restricted() {
  return (
    <ScreenPanel
      screen='restricted'
      restricted={{ onSignIn: noop, onEmailSupport: noop }}
    />
  );
}

export function Waitlist() {
  return (
    <ScreenPanel
      screen='waitlist'
      restricted={{ onSignIn: noop, onJoinWaitlist: noop }}
    />
  );
}

export function AlternativePhone() {
  return (
    <ScreenPanel
      screen='alternativePhone'
      alternativePhone={{ channel: whatsApp }}
    />
  );
}

export function AlternativePhoneLegalConsent() {
  return (
    <ScreenPanel
      screen='alternativePhone'
      alternativePhone={{ channel: whatsApp, legalConsent }}
    />
  );
}

export function VerifyEmail() {
  return <ScreenPanel screen='verifyEmail' />;
}

export function VerifyPhone() {
  return <ScreenPanel screen='verifyPhone' />;
}

export function VerifyPhoneAlternativeChannel() {
  return (
    <ScreenPanel
      screen='verifyPhone'
      verifyPhone={{ ...verifyScreen(PHONE), provider: 'WhatsApp', onCancel: noop }}
    />
  );
}

export function VerifyEmailLink() {
  return (
    <ScreenPanel
      screen='verifyEmailLink'
      verifyEmailLink={{
        identifier: EMAIL,
        isPending: false,
        onEditIdentifier: noop,
        onResend: noop,
        canResend: true,
      }}
    />
  );
}

export function EmailLinkSignedUp() {
  return (
    <ScreenPanel
      screen='emailLinkStatus'
      emailLinkStatus={{ status: 'signed-in' }}
    />
  );
}

export function EnterpriseConnections() {
  return (
    <ScreenPanel
      screen='enterpriseConnections'
      enterpriseConnections={{
        options: [
          { id: 'acme-okta', name: 'Acme Okta', iconUrl: 'https://img.clerk.com/static/okta.svg' },
          { id: 'acme-google', name: 'Acme Google Workspace', iconUrl: 'https://img.clerk.com/static/google.svg' },
        ],
        onSelectConnection: noop,
      }}
    />
  );
}

export function Wallets() {
  return (
    <ScreenPanel
      screen='wallets'
      wallets={{
        options: [
          { id: 'phantom', name: 'Phantom', iconUrl: 'https://img.clerk.com/static/phantom.svg' },
          { id: 'metamask', name: 'MetaMask', iconUrl: 'https://img.clerk.com/static/metamask.svg' },
        ],
        isDisabled: false,
        onSelectWallet: noop,
        onBack: noop,
      }}
    />
  );
}

export function WalletsSingle() {
  return (
    <ScreenPanel
      screen='wallets'
      wallets={{
        options: [{ id: 'phantom', name: 'Phantom', iconUrl: 'https://img.clerk.com/static/phantom.svg' }],
        isDisabled: false,
        onSelectWallet: noop,
        onBack: noop,
      }}
    />
  );
}

export function Loading() {
  return <ScreenPanel screen='loading' />;
}

export function StartOver() {
  return <ScreenPanel screen='startOver' />;
}

export function ProtectCheck() {
  return (
    <ScreenPanel
      screen='protectCheck'
      protectCheck={{ challenge: false, isPending: true }}
    />
  );
}

export function ActionBlocked() {
  return (
    <ScreenPanel
      screen='actionBlocked'
      actionBlocked={{ linkUrl: 'https://acme.com/support', linkText: 'Contact support', traceId: 'trc_2x7Hq9LmP4' }}
    />
  );
}
