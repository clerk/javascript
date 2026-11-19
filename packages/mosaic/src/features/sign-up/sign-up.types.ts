import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import type { ReactNode, Ref } from 'react';

import type { AuthActionBlockedDetails, AuthEmailLinkStatusValue, AuthProvider } from '../../blocks/auth';
import type { FieldFeedback, UseFormResult } from '../../components/form';
import type { AuthFlowSubmitEvent, AuthFlowValues } from '../auth-flow/auth-flow.types';
import type { SignUpVerificationModel } from './sign-up.model';
import type { SignUpRoute } from './sign-up.routes';

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

export interface SignUpCode {
  purpose: 'verify-email' | 'verify-phone';
  identifier: string;
  provider?: string;
}

export type SignUpValues = AuthFlowValues;

export type SignUpSubmitEvent = AuthFlowSubmitEvent;

export type SignUpScreen =
  | SignUpRoute
  | 'startOver'
  | 'actionBlocked'
  | 'restricted'
  | 'waitlist'
  | 'alternativePhone'
  | 'verifyEmailLink'
  | 'emailLinkStatus'
  | 'wallets'
  | 'loading';

export interface SignUpDetailsScreen {
  step: SignUpDetails;
  socialProviders: readonly AuthProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  form: UseFormResult<SignUpValues>;
  onSubmit: (event: SignUpSubmitEvent) => void;
  isPending: boolean;
  isDisabled: boolean;
  globalErrorMessage?: string;
  passwordFeedback?: FieldFeedback;
  onSwitchField?: () => void;
  onSignIn?: () => void;
}

export interface SignUpVerifyScreen {
  verification: SignUpVerificationModel;
  onNext: (step: SignUpNextStep) => void;
  provider?: string;
  isPending: boolean;
  globalErrorMessage?: string;
  onEditIdentifier: () => void;
  onCancel?: () => void;
}

export interface SignUpRestrictedScreen {
  globalErrorMessage?: string;
  onEmailSupport?: () => void;
  onJoinWaitlist?: () => void;
  onSignIn?: () => void;
}

export interface SignUpAlternativePhoneScreen {
  channel: AuthProvider;
  legalConsent?: SignUpLegalConsent;
  form: UseFormResult<SignUpValues>;
  onSubmit: (event: SignUpSubmitEvent) => void;
  isPending: boolean;
  isDisabled: boolean;
  globalErrorMessage?: string;
  onCancel?: () => void;
}

export interface SignUpEmailLinkScreen {
  identifier: string;
  isPending: boolean;
  globalErrorMessage?: string;
  onEditIdentifier: () => void;
  onResend?: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
}

export interface SignUpEmailLinkStatusScreen {
  status: AuthEmailLinkStatusValue;
  globalErrorMessage?: string;
}

export interface SignUpEnterpriseConnectionsScreen {
  options: readonly AuthProvider[];
  pendingConnectionId?: string;
  globalErrorMessage?: string;
  onSelectConnection: (id: string) => void;
}

export interface SignUpWalletsScreen {
  options: readonly AuthProvider[];
  pendingWalletId?: string;
  isDisabled: boolean;
  globalErrorMessage?: string;
  onSelectWallet: (id: string) => void;
  onBack: () => void;
}

export interface SignUpProtectCheckScreen {
  challenge: boolean;
  isPending: boolean;
  globalErrorMessage?: string;
  containerRef?: Ref<HTMLDivElement>;
  onRetry?: () => void;
}

export interface SignUpViewProps {
  screen: SignUpScreen;
  applicationName: string;
  applicationLogoUrl?: string;
  start: SignUpDetailsScreen;
  continue: SignUpDetailsScreen;
  verifyEmail: ReactNode;
  verifyPhone: ReactNode;
  restricted: SignUpRestrictedScreen;
  actionBlocked?: AuthActionBlockedDetails;
  onStartOver: () => void;
  alternativePhone?: SignUpAlternativePhoneScreen;
  verifyEmailLink?: SignUpEmailLinkScreen;
  emailLinkStatus?: SignUpEmailLinkStatusScreen;
  enterpriseConnections?: SignUpEnterpriseConnectionsScreen;
  wallets?: SignUpWalletsScreen;
  protectCheck?: SignUpProtectCheckScreen;
  taskChooseOrganization?: ReactNode;
}
