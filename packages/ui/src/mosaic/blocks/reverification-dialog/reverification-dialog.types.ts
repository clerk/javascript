export type ReverificationStrategy = 'password' | 'email_code' | 'phone_code' | 'passkey' | 'totp' | 'backup_code';

export type ReverificationStage = 'first' | 'second';

export interface ReverificationFactor {
  id: string;
  strategy: ReverificationStrategy;
  label: string;
  identifier?: string;
}

export interface ReverificationDialogErrors {
  field?: string;
  form?: string;
}

export interface ReverificationDialogResendState {
  isResending: boolean;
  secondsRemaining: number;
}

export interface ReverificationDialogState {
  strategy: ReverificationStrategy;
  step?: 'select-first-factor' | 'prepare' | 'verify' | 'select-second-factor' | 'unavailable' | 'help';
  stage?: ReverificationStage;
  availableFactors?: ReverificationFactor[];
  preparationStatus?: 'preparing' | 'error';
  identifier?: string;
  value: string;
  status: 'idle' | 'verifying' | 'error';
  errors: ReverificationDialogErrors;
  resend: ReverificationDialogResendState;
}

export interface ReverificationDialogActions {
  onValueChange: (value: string) => void;
  onSubmit: (completedValue?: string) => void;
  onResend: () => void;
  onCancel: () => void;
  onSelectFactor?: (factorId: string) => void;
  onBack?: () => void;
  onPrepare?: () => void;
  onShowHelp?: () => void;
}

export interface ReverificationDialogViewProps {
  open: boolean;
  strategy: ReverificationStrategy;
  step?: ReverificationDialogState['step'];
  availableFactors?: ReverificationFactor[];
  preparationStatus?: ReverificationDialogState['preparationStatus'];
  identifier?: string;
  value: string;
  isVerifying?: boolean;
  fieldError?: string;
  formError?: string;
  isResending?: boolean;
  resendSecondsRemaining?: number;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onSubmit: (completedValue?: string) => void;
  onResend: () => void;
  onSelectFactor?: (factorId: string) => void;
  onBack?: () => void;
  onPrepare?: () => void;
  onShowHelp?: () => void;
}

export interface ReverificationDialogOperation {
  strategy: ReverificationStrategy;
  stage: ReverificationStage;
  identifier?: string;
}

export interface ReverificationDialogAttempt extends ReverificationDialogOperation {
  value: string;
}

export type ReverificationDialogSubmissionResult =
  | { status: 'complete' }
  | { status: 'needs_second_factor'; factors: ReverificationFactor[] };

export interface ReverificationDialogMachineDependencies {
  initialState: ReverificationDialogState;
  prepare: (operation: ReverificationDialogOperation) => Promise<void>;
  submit: (attempt: ReverificationDialogAttempt) => Promise<ReverificationDialogSubmissionResult>;
  resend: (operation: ReverificationDialogOperation) => Promise<void>;
  onCancel?: () => void;
  mapError?: (error: unknown) => ReverificationDialogErrors;
}
