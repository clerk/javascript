import type { OTPInputProps } from '@/ui/elements/CodeControl';
import type { FormControlState } from '@/ui/utils/useFormControl';

export type VerifyDomainFormModel = {
  scope: string;
  canRun: () => boolean;
  errorMessage?: string;
  retry: () => void;
  available: boolean;
  hasDomain: boolean;
  isLoading: boolean;
  domainName: string;
  prepare: (emailAddress: string, canContinue?: () => boolean) => Promise<boolean>;
  attempt: (code: string, canContinue?: () => boolean) => Promise<boolean | undefined>;
};

export type VerifyDomainFormData = {
  wizardProps: { step: number };
  errorMessage?: string;
  retry: () => void;
  emailField: FormControlState<'affiliationEmailAddress'>;
  otp: OTPInputProps & { onFakeContinue: () => void };
  canSubmit: boolean;
  emailDomainSuffix: string;
  domainName: string;
  verificationEmail: string;
  onSubmitPrepare: () => Promise<void>;
  onBack: () => void;
};
