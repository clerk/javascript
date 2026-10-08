import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '@/ui/localization';

export type TotpSetupData = { uri: string | undefined; secret: string | undefined };

export type TotpSetupModel = {
  requestKey: string;
  canRun: () => boolean;
  setup: TotpSetupData | undefined;
  createTOTP: () => Promise<TotpSetupData | undefined>;
  isCancellation: (error: unknown) => boolean;
};

export type TotpVerificationModel = {
  requestKey: string;
  canRun: () => boolean;
  verifyCode: (code: string, canContinue?: () => boolean) => Promise<boolean>;
};

export type MfaTotpData = TotpSetupModel & TotpVerificationModel & { backupCodes: string[] | undefined };
export type TotpSetupOptions = FormProps & { title: LocalizationKey };
export type TotpVerificationOptions = FormProps & { onBack: () => void };
