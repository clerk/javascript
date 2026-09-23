import type { SessionVerificationLevel } from '@clerk/shared/types';

import type { FlowDirection } from '../../components/flow';

export type ReverificationStrategy = 'password' | 'passkey' | 'email_code' | 'phone_code' | 'totp' | 'backup_code';

export type ReverificationStage = 'first' | 'second';

export type ReverificationOtpChannel = 'email' | 'phone' | 'totp';

export type ReverificationStep = 'password' | 'passkey' | 'otp' | 'backup-code' | 'method-picker' | 'help';

export type ReverificationMethod =
  | { id: string; stage: 'first'; strategy: 'password' | 'passkey' }
  | { id: string; stage: 'first'; strategy: 'email_code'; emailAddressId: string; identifier: string }
  | { id: string; stage: 'first' | 'second'; strategy: 'phone_code'; phoneNumberId: string; identifier: string }
  | { id: string; stage: 'second'; strategy: 'totp' | 'backup_code' };

export type ReverificationPreparableMethod = Extract<ReverificationMethod, { strategy: 'email_code' | 'phone_code' }>;

type ReverificationViewFields = {
  direction?: FlowDirection;
  value: string;
  onValueChange: (value: string) => void;
  errorMessage?: string;
  isPending: boolean;
  onSubmit: () => void;
  onShowMethods: () => void;
  onShowHelp: () => void;
  onBack: () => void;
  onEmailSupport: () => void;
  methods: readonly ReverificationMethod[];
  pendingMethodId?: string;
  onSelectMethod: (id: string) => void;
  otpChannel?: ReverificationOtpChannel;
  onResend: () => void;
  canResend: boolean;
  resendRemainingSeconds?: number;
};

export type ReverificationViewProps = ReverificationViewFields & {
  step: ReverificationStep;
};

export type ReverificationState =
  | { phase: 'inactive' }
  | { phase: 'active'; complete: () => void; cancel: () => void; level: SessionVerificationLevel | undefined }
  | { phase: 'retrying' };

export type ReverificationResult = {
  status: 'needs_first_factor' | 'needs_second_factor' | 'complete';
  methods: readonly ReverificationMethod[];
  startingMethod: ReverificationMethod | null;
};
