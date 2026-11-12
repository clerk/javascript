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
  | { kind: 'notice'; purpose: 'help' }
  | { kind: 'notice'; purpose: 'forgot-password'; identifier: string }
  | { kind: 'notice'; purpose: 'no-methods' | 'password-compromised' | 'enterprise-sso' }
  | { kind: 'notice'; purpose: 'action-blocked'; details?: SignInActionBlockedDetails }
  | { kind: 'notice'; purpose: 'email-link'; identifier: string }
  | { kind: 'new-password'; reason: 'forgot' }
  | { kind: 'sign-up' };

export interface SignInActionBlockedDetails {
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  traceId?: string;
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
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
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
  onEmailSupport: () => void;
  pendingFactorId?: string;
  onSelectFactor: (id: string) => void;
  onResend?: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
}
