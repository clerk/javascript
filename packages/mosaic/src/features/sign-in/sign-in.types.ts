import type { FlowDirection } from '../../components/flow';
import type { ReverificationMethod, ReverificationOtpChannel } from '../reverification';

export type SignInStep =
  | 'start'
  | 'password'
  | 'email-code'
  | 'totp'
  | 'backup-code'
  | 'method-picker'
  | 'help'
  | 'sign-up'
  | 'verify-email';

export type SignInMethod = ReverificationMethod;

export type SignInOtpChannel = ReverificationOtpChannel;

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
  onShowMethods: () => void;
  onShowHelp: () => void;
  onBack: () => void;
  onEmailSupport: () => void;
  methods: readonly SignInMethod[];
  pendingMethodId?: string;
  onSelectMethod: (id: string) => void;
  otpChannel?: SignInOtpChannel;
  onResend: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
  signUpDetails: SignUpDetails;
  signUpErrors?: Partial<Record<keyof SignUpDetails, string>>;
  onSignUpDetailChange: (field: keyof SignUpDetails, value: string) => void;
}
