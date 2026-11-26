import type { Ref } from 'react';

import type {
  AuthActionBlockedDetails,
  AuthEmailLinkStatusValue,
  AuthPasswordRule,
  AuthProvider,
} from '../../blocks/auth';
import type { FlowDirection } from '../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../components/form';
import type { AuthFlowSubmitEvent, AuthFlowValues } from '../auth-flow/auth-flow.types';
import type { SignUpFields, SignUpLegalConsent } from '../sign-up/sign-up.types';

export type SignInFactor =
  | { id: string; stage: 'first'; strategy: 'password' }
  | { id: string; stage: 'first' | 'second'; strategy: 'passkey' }
  | {
      id: string;
      stage: 'first' | 'second';
      strategy: 'email_code';
      emailAddressId: string;
      identifier: string;
      primary?: boolean;
    }
  | {
      id: string;
      stage: 'first' | 'second';
      strategy: 'email_link';
      emailAddressId: string;
      identifier: string;
      primary?: boolean;
    }
  | {
      id: string;
      stage: 'first' | 'second';
      strategy: 'phone_code';
      phoneNumberId: string;
      identifier: string;
      primary?: boolean;
    }
  | { id: string; stage: 'second'; strategy: 'totp' | 'backup_code' }
  | {
      id: string;
      stage: 'first';
      strategy: 'reset_password_email_code' | 'reset_password_phone_code';
      identifier: string;
    };

export type SignInProvider = AuthProvider;

export type SignInValues = AuthFlowValues;

export type SignInSubmitEvent = AuthFlowSubmitEvent;

export type SignInActionBlockedDetails = AuthActionBlockedDetails;

export type SignInEmailLinkStatus = AuthEmailLinkStatusValue;

export type SignInIdentifierField = 'email' | 'email-or-username' | 'username' | 'phone';

export type SignInStep =
  | {
      kind: 'identifier';
      field?: SignInIdentifierField;
      nextField?: SignInIdentifierField;
      lastUsed?: boolean;
      password?: boolean;
      passwordVisible?: boolean;
      emailFirst?: boolean;
    }
  | {
      kind: 'identifier';
      field: 'phone';
      channel: SignInProvider;
      flow?: 'sign-in' | 'sign-up';
      legalConsent?: SignUpLegalConsent;
    }
  | { kind: 'credential'; credential: 'password'; identifier: string; alternatives?: readonly SignInFactor[] }
  | { kind: 'credential'; credential: 'backup-code'; identifier: string; resetting?: boolean }
  | { kind: 'credential'; credential: 'passkey'; identifier?: string }
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
      channel: 'email' | 'phone' | 'totp';
      identifier?: string;
      alternatives?: readonly { id: string; identifier: string }[];
      methods?: readonly SignInFactor[];
      provider?: string;
      resetting?: boolean;
    }
  | {
      kind: 'choice';
      purpose: 'methods';
      options: readonly SignInFactor[];
      canGoBack?: boolean;
    }
  | { kind: 'choice'; purpose: 'addresses'; options: readonly SignInFactor[] }
  | { kind: 'choice'; purpose: 'reset-methods'; options: readonly SignInFactor[] }
  | { kind: 'choice'; purpose: 'enterprise-connections'; options: readonly SignInProvider[] }
  | { kind: 'choice'; purpose: 'accounts'; options: readonly SignInAccount[] }
  | { kind: 'choice'; purpose: 'wallets'; options: readonly SignInProvider[]; loading?: boolean }
  | { kind: 'notice'; purpose: 'help' }
  | { kind: 'notice'; purpose: 'forgot-password'; identifier: string }
  | { kind: 'notice'; purpose: 'no-methods' | 'password-compromised' | 'enterprise-sso' | 'start-over' | 'loading' }
  | { kind: 'notice'; purpose: 'protect-check'; challenge: boolean }
  | { kind: 'notice'; purpose: 'action-blocked'; details?: SignInActionBlockedDetails }
  | { kind: 'notice'; purpose: 'email-link'; identifier: string; newDevice?: boolean }
  | { kind: 'notice'; purpose: 'email-link-status'; status: SignInEmailLinkStatus; flow: 'sign-in' | 'sign-up' }
  | { kind: 'notice'; purpose: 'verify-email-link'; identifier: string }
  | { kind: 'notice'; purpose: 'restricted' | 'waitlist' }
  | { kind: 'new-password'; reason: 'forgot' | 'required' }
  | {
      kind: 'sign-up';
      purpose?: 'start' | 'continue';
      fields: SignUpFields;
      nextField?: 'emailAddress' | 'phoneNumber';
      legalConsent?: SignUpLegalConsent;
    };

export interface SignInAccount {
  id: string;
  name: string;
  identifier: string;
  imageUrl?: string;
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
  passkeyInlineFrom?: number;
  form: UseFormResult<SignInValues>;
  onSubmit: (event?: SignInSubmitEvent) => void;
  onCodeComplete: (code: string) => void;
  isPending: boolean;
  isDisabled: boolean;
  errorMessage?: string;
  globalErrorMessage?: string;
  newPasswordFeedback?: FieldFeedback;
  newPasswordRules?: readonly AuthPasswordRule[];
  onEditIdentifier: () => void;
  onSwitchField?: () => void;
  onSignUp?: () => void;
  onJoinWaitlist?: () => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  onShowHelp: () => void;
  onBack: () => void;
  onStartOver: () => void;
  onRetry?: () => void;
  protectCheckRef?: Ref<HTMLDivElement>;
  onEmailSupport: () => void;
  pendingFactorId?: string;
  onSelectFactor: (id: string) => void;
  onChangeAddress?: () => void;
  pendingAccountId?: string;
  onSelectAccount: (id: string) => void;
  onAddAccount?: () => void;
  onSignOutAll?: () => void;
  onResend?: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
}
