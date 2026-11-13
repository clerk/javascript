import type { FlowDirection } from '../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../components/form';

export type SignInFactor =
  | { id: string; stage: 'first'; strategy: 'password' }
  | { id: string; stage: 'first' | 'second'; strategy: 'passkey' }
  | { id: string; stage: 'first'; strategy: 'email_code'; emailAddressId: string; identifier: string }
  | { id: string; stage: 'first' | 'second'; strategy: 'phone_code'; phoneNumberId: string; identifier: string }
  | { id: string; stage: 'second'; strategy: 'totp' | 'backup_code' }
  | {
      id: string;
      stage: 'first';
      strategy: 'reset_password_email_code' | 'reset_password_phone_code';
      identifier: string;
    };

type SignInCodeChannel = 'email' | 'phone' | 'totp';

export type SignInIdentifierField = 'email' | 'email-or-username' | 'username' | 'phone';

export type SignInStep =
  | { kind: 'identifier'; field: SignInIdentifierField; nextField?: SignInIdentifierField; lastUsed?: boolean }
  | { kind: 'identifier'; field: 'phone'; channel: SignInProvider }
  | { kind: 'credential'; credential: 'password' | 'backup-code' | 'passkey'; identifier: string }
  | {
      kind: 'code';
      purpose:
        | 'first-factor'
        | 'second-factor'
        | 'client-trust'
        | 'sso-bypass'
        | 'reset-password'
        | 'verify-email'
        | 'verify-phone';
      channel: SignInCodeChannel;
      identifier?: string;
      provider?: string;
    }
  | { kind: 'choice'; purpose: 'methods' | 'reset-methods'; options: readonly SignInFactor[] }
  | { kind: 'choice'; purpose: 'enterprise-connections'; options: readonly SignInProvider[] }
  | { kind: 'choice'; purpose: 'accounts'; options: readonly SignInAccount[] }
  | { kind: 'choice'; purpose: 'wallets'; options: readonly SignInProvider[] }
  | { kind: 'notice'; purpose: 'help' }
  | { kind: 'notice'; purpose: 'forgot-password'; identifier: string }
  | { kind: 'notice'; purpose: 'no-methods' | 'password-compromised' | 'enterprise-sso' | 'start-over' }
  | { kind: 'notice'; purpose: 'action-blocked'; details?: SignInActionBlockedDetails }
  | { kind: 'notice'; purpose: 'email-link'; identifier: string }
  | { kind: 'notice'; purpose: 'email-link-status'; status: SignInEmailLinkStatus; flow: 'sign-in' | 'sign-up' }
  | { kind: 'notice'; purpose: 'verify-email-link'; identifier: string }
  | { kind: 'new-password'; reason: 'forgot' | 'required' }
  | {
      kind: 'sign-up';
      fields: SignUpFields;
      nextField?: 'emailAddress' | 'phoneNumber';
      legalConsent?: SignUpLegalConsent;
    };

export type SignInEmailLinkStatus =
  | 'loading'
  | 'signed-in'
  | 'signed-in-other-tab'
  | 'transferable'
  | 'expired'
  | 'failed'
  | 'client-mismatch';

export type SignUpFieldName = 'firstName' | 'lastName' | 'username' | 'emailAddress' | 'phoneNumber' | 'password';

export type SignUpFields = Partial<Record<SignUpFieldName, { required: boolean }>>;

export interface SignUpLegalConsent {
  termsUrl?: string;
  privacyPolicyUrl?: string;
}

export interface SignInActionBlockedDetails {
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  traceId?: string;
}

export interface SignInAccount {
  id: string;
  name: string;
  identifier: string;
  imageUrl?: string;
}

export interface SignInProvider {
  id: string;
  name: string;
  iconUrl: string;
}

export interface SignInValues {
  identifier: string;
  phoneNumber: string;
  password: string;
  code: string;
  backupCode: string;
  firstName: string;
  lastName: string;
  username: string;
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
  legalAccepted: boolean;
}

export interface SignInSubmitEvent {
  preventDefault: () => void;
}

export interface SignInViewProps {
  step: SignInStep;
  direction?: FlowDirection;
  applicationName: string;
  applicationLogoUrl?: string;
  combined: boolean;
  socialProviders: readonly SignInProvider[];
  pendingProviderId?: string;
  lastUsedProviderId?: string;
  onSelectProvider: (id: string) => void;
  onPasskey?: () => void;
  form: UseFormResult<SignInValues>;
  onSubmit: (event?: SignInSubmitEvent) => void;
  onCodeComplete: (code: string) => void;
  isPending: boolean;
  isDisabled: boolean;
  errorMessage?: string;
  globalErrorMessage?: string;
  newPasswordFeedback?: FieldFeedback;
  onEditIdentifier: () => void;
  onSwitchField?: () => void;
  onSignUp?: () => void;
  onJoinWaitlist?: () => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  onShowHelp: () => void;
  onBack: () => void;
  onStartOver: () => void;
  onEmailSupport: () => void;
  pendingFactorId?: string;
  onSelectFactor: (id: string) => void;
  pendingAccountId?: string;
  onSelectAccount: (id: string) => void;
  onAddAccount?: () => void;
  onSignOutAll?: () => void;
  onResend?: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
}
