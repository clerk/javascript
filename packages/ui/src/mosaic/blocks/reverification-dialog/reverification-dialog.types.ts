export type ReverificationStage = 'first' | 'second';

interface ReverificationFactorBase {
  id: string;
  label: string;
}

export interface ReverificationPasswordFactor extends ReverificationFactorBase {
  stage: 'first';
  strategy: 'password';
}

export interface ReverificationEmailCodeFactor extends ReverificationFactorBase {
  stage: 'first';
  strategy: 'email_code';
  emailAddressId: string;
  safeIdentifier: string;
}

export interface ReverificationFirstFactorPhoneCodeFactor extends ReverificationFactorBase {
  stage: 'first';
  strategy: 'phone_code';
  phoneNumberId: string;
  safeIdentifier: string;
}

export interface ReverificationPasskeyFactor extends ReverificationFactorBase {
  stage: 'first';
  strategy: 'passkey';
}

export interface ReverificationSecondFactorPhoneCodeFactor extends ReverificationFactorBase {
  stage: 'second';
  strategy: 'phone_code';
  phoneNumberId: string;
  safeIdentifier: string;
}

export interface ReverificationTOTPFactor extends ReverificationFactorBase {
  stage: 'second';
  strategy: 'totp';
}

export interface ReverificationBackupCodeFactor extends ReverificationFactorBase {
  stage: 'second';
  strategy: 'backup_code';
}

export type ReverificationFirstFactor =
  | ReverificationPasswordFactor
  | ReverificationEmailCodeFactor
  | ReverificationFirstFactorPhoneCodeFactor
  | ReverificationPasskeyFactor;

export type ReverificationSecondFactor =
  | ReverificationSecondFactorPhoneCodeFactor
  | ReverificationTOTPFactor
  | ReverificationBackupCodeFactor;

export type ReverificationFactor = ReverificationFirstFactor | ReverificationSecondFactor;

export type ReverificationStrategy = ReverificationFactor['strategy'];

export type ReverificationChallenge =
  | {
      status: 'needs_first_factor';
      factors: ReverificationFirstFactor[];
      initialFactorId?: string;
    }
  | {
      status: 'needs_second_factor';
      factors: ReverificationSecondFactor[];
      initialFactorId?: string;
    };

export type ReverificationPreparationFactor = Extract<ReverificationFactor, { strategy: 'email_code' | 'phone_code' }>;

export type ReverificationAttempt =
  | { factor: ReverificationPasswordFactor; password: string }
  | {
      factor: Exclude<ReverificationFactor, ReverificationPasswordFactor | ReverificationPasskeyFactor>;
      code: string;
    }
  | { factor: ReverificationPasskeyFactor };

export type ReverificationAttemptResult =
  | { status: 'complete' }
  | {
      status: 'needs_second_factor';
      factors: ReverificationSecondFactor[];
      initialFactorId?: string;
    };

export interface ReverificationDialogError {
  location: 'field' | 'form';
  message: string;
}

export interface ReverificationDialogResendState {
  isResending: boolean;
  secondsRemaining: number;
}

interface ReverificationDialogViewBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ReverificationDialogSelectViewProps extends ReverificationDialogViewBaseProps {
  step: 'select-factor';
  stage: ReverificationStage;
  availableFactors: ReverificationFactor[];
  formError?: string;
  onSelectFactor: (factorId: string) => void;
  onBack?: () => void;
  onShowHelp: () => void;
}

export interface ReverificationDialogVerifyViewProps extends ReverificationDialogViewBaseProps {
  step: 'verify';
  factor: ReverificationFactor;
  value: string;
  canSubmit: boolean;
  isInputDisabled: boolean;
  isVerifying: boolean;
  fieldError?: string;
  formError?: string;
  resend?: ReverificationDialogResendState;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onResend?: () => void;
  onShowAlternatives?: () => void;
  onShowHelp?: () => void;
}

export interface ReverificationDialogUnavailableViewProps extends ReverificationDialogViewBaseProps {
  step: 'unavailable';
}

export interface ReverificationDialogHelpViewProps extends ReverificationDialogViewBaseProps {
  step: 'help';
  onBack: () => void;
}

export type ReverificationDialogViewProps =
  | ReverificationDialogSelectViewProps
  | ReverificationDialogVerifyViewProps
  | ReverificationDialogUnavailableViewProps
  | ReverificationDialogHelpViewProps;
