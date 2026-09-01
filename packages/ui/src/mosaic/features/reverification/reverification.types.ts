import type { SessionVerificationLevel } from '@clerk/shared/types';

import type { FlowDirection } from '../../components/flow';

export type ReverificationStrategy = 'password' | 'passkey' | 'email_code' | 'phone_code' | 'totp' | 'backup_code';

export type ReverificationOtpChannel = 'email' | 'phone' | 'totp';

export type ReverificationStep = 'password' | 'passkey' | 'otp' | 'backup-code' | 'method-picker' | 'help';

export type ReverificationMethod = {
  id: string;
  strategy: ReverificationStrategy;
  identifier?: string;
  emailAddressId?: string;
  phoneNumberId?: string;
};

export type ReverificationViewProps = {
  step: ReverificationStep;
  direction?: FlowDirection;
  value: string;
  onValueChange: (value: string) => void;
  errorMessage?: string;
  isPending: boolean;
  onSubmit: () => void;
  onVerifyPasskey: () => void;
  onShowMethods?: () => void;
  onShowHelp: () => void;
  onBack?: () => void;
  onEmailSupport: () => void;
  methods: readonly ReverificationMethod[];
  onSelectMethod: (id: string) => void;
  otpChannel?: ReverificationOtpChannel;
  identifier?: string;
  onResend?: () => void;
  canResend?: boolean;
};

export type ReverificationProps =
  | { isActive: false; complete?: undefined; cancel?: undefined; level?: undefined }
  | { isActive: true; complete: () => void; cancel: () => void; level: SessionVerificationLevel | undefined };

export type ReverificationResult = {
  status: 'needs_first_factor' | 'needs_second_factor' | 'complete';
  methods: readonly ReverificationMethod[];
  startingMethod: ReverificationMethod | null;
};
