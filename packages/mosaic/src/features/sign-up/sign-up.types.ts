import type { Ref } from 'react';

import type { FlowDirection } from '../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../components/form';
import type {
  AuthFlowActionBlockedDetails,
  AuthFlowEmailLinkStatus,
  AuthFlowProvider,
  AuthFlowSubmitEvent,
  AuthFlowValues,
} from '../auth-flow/auth-flow.types';

export type SignUpFieldName = 'firstName' | 'lastName' | 'username' | 'emailAddress' | 'phoneNumber' | 'password';

export type SignUpFields = Partial<Record<SignUpFieldName, { required: boolean; disabled?: boolean }>>;

export interface SignUpLegalConsent {
  termsUrl?: string;
  privacyPolicyUrl?: string;
}

export interface SignUpDetails {
  purpose?: 'start' | 'continue';
  fields: SignUpFields;
  nextField?: 'emailAddress' | 'phoneNumber';
  legalConsent?: SignUpLegalConsent;
}

export type SignUpStep =
  | ({ kind: 'details'; purpose: 'start' | 'continue' } & SignUpDetails)
  | { kind: 'alternative-phone'; channel: AuthFlowProvider; legalConsent?: SignUpLegalConsent }
  | { kind: 'code'; purpose: 'verify-email' | 'verify-phone'; identifier: string; provider?: string }
  | { kind: 'choice'; purpose: 'enterprise-connections' | 'wallets'; options: readonly AuthFlowProvider[] }
  | { kind: 'notice'; purpose: 'verify-email-link'; identifier: string }
  | { kind: 'notice'; purpose: 'email-link-status'; status: AuthFlowEmailLinkStatus }
  | { kind: 'notice'; purpose: 'restricted' | 'waitlist' | 'loading' }
  | { kind: 'notice'; purpose: 'protect-check'; challenge: boolean }
  | { kind: 'notice'; purpose: 'action-blocked'; details?: AuthFlowActionBlockedDetails };

export type SignUpValues = AuthFlowValues;

export type SignUpSubmitEvent = AuthFlowSubmitEvent;

export interface SignUpViewProps {
  step: SignUpStep;
  direction?: FlowDirection;
  applicationName: string;
  applicationLogoUrl?: string;
  socialProviders: readonly AuthFlowProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  form: UseFormResult<SignUpValues>;
  onSubmit: (event?: SignUpSubmitEvent) => void;
  onCodeComplete: (code: string) => void;
  isPending: boolean;
  isDisabled: boolean;
  errorMessage?: string;
  globalErrorMessage?: string;
  passwordFeedback?: FieldFeedback;
  onSwitchField?: () => void;
  onSignIn?: () => void;
  onEditIdentifier: () => void;
  onCancel?: () => void;
  onBack: () => void;
  onEmailSupport?: () => void;
  onJoinWaitlist?: () => void;
  onResend?: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
  onRetry?: () => void;
  protectCheckRef?: Ref<HTMLDivElement>;
}
