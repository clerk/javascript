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

export type SignInStep =
  | { kind: 'identifier' }
  | { kind: 'credential'; credential: 'password' | 'backup-code' | 'passkey'; identifier: string }
  | {
      kind: 'code';
      purpose: 'first-factor' | 'second-factor' | 'reset-password' | 'verify-email';
      channel: SignInCodeChannel;
      identifier?: string;
    }
  | { kind: 'choice'; purpose: 'methods' | 'reset-methods'; options: readonly SignInFactor[] }
  | { kind: 'notice'; purpose: 'help' }
  | { kind: 'notice'; purpose: 'forgot-password'; identifier: string }
  | { kind: 'notice'; purpose: 'no-methods' | 'password-compromised' }
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

export interface SignInSocialProvider {
  id: string;
  name: string;
  iconUrl: string;
}

export interface SignInValues {
  identifier: string;
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
  socialProviders: readonly SignInSocialProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  form: UseFormResult<SignInValues>;
  onSubmit: (event?: SignInSubmitEvent) => void;
  onCodeComplete: (code: string) => void;
  isPending: boolean;
  isDisabled: boolean;
  errorMessage?: string;
  globalErrorMessage?: string;
  newPasswordFeedback?: FieldFeedback;
  onEditIdentifier: () => void;
  onSignUp?: () => void;
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
