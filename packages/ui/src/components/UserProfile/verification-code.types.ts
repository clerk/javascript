import type { OTPInputProps } from '@/ui/elements/CodeControl';

export type VerificationCodeData = {
  requestKey?: string;
  canRun?: () => boolean;
  identifier: string;
  attemptVerification: (code: string) => Promise<unknown> | undefined;
  prepareVerification: () => Promise<unknown> | undefined;
};

export type VerifyWithCodeProps = VerificationCodeData & {
  nextStep: () => void;
  onReset: () => void;
};

export type VerifyWithCodeViewData = {
  otp: Pick<OTPInputProps, 'isLoading' | 'otpControl' | 'onResendCode'> & {
    onFakeContinue: () => void;
  };
  identifier: string;
  onReset: () => void;
};
