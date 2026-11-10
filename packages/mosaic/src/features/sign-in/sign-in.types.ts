import type { FlowDirection } from '../../components/flow';

export type SignInFactor =
  | { id: string; stage: 'first'; strategy: 'password' }
  | { id: string; stage: 'first' | 'second'; strategy: 'passkey' }
  | { id: string; stage: 'first'; strategy: 'email_code'; emailAddressId: string; identifier: string }
  | { id: string; stage: 'first' | 'second'; strategy: 'phone_code'; phoneNumberId: string; identifier: string }
  | { id: string; stage: 'second'; strategy: 'totp' | 'backup_code' };

type SignInCodeChannel = 'email' | 'phone' | 'totp';

export type SignInStep =
  | { kind: 'identifier' }
  | { kind: 'secret'; secret: 'password' | 'backup-code'; identifier: string }
  | {
      kind: 'code';
      purpose: 'first-factor' | 'second-factor' | 'verify-email';
      channel: SignInCodeChannel;
      identifier?: string;
    }
  | { kind: 'choice'; purpose: 'methods'; options: readonly SignInFactor[] }
  | { kind: 'notice'; purpose: 'help' }
  | { kind: 'sign-up' };

export interface SignInSocialProvider {
  id: string;
  name: string;
  iconUrl: string;
}

export interface SignUpDetails {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
}

export interface SignInViewProps {
  step: SignInStep;
  direction?: FlowDirection;
  applicationName: string;
  applicationLogoUrl?: string;
  combined: boolean;
  socialProviders: readonly SignInSocialProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  identifier: string;
  onIdentifierChange: (value: string) => void;
  onEditIdentifier: () => void;
  onSignUp?: () => void;
  value: string;
  onValueChange: (value: string) => void;
  errorMessage?: string;
  isPending: boolean;
  onSubmit: () => void;
  onForgotPassword?: () => void;
  onShowMethods?: () => void;
  onShowHelp: () => void;
  onBack: () => void;
  onEmailSupport: () => void;
  pendingFactorId?: string;
  onSelectFactor: (id: string) => void;
  onResend: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
  signUpDetails: SignUpDetails;
  signUpErrors?: Partial<Record<keyof SignUpDetails, string>>;
  onSignUpDetailChange: (field: keyof SignUpDetails, value: string) => void;
}
