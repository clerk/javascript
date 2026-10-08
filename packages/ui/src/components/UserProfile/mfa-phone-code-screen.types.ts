import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '@/ui/localization';

import type { AddPhoneData } from './phone-form.types';
import type { VerificationCodeData } from './verification-code.types';

export type MfaPhoneCodeScreenProps = FormProps;

export type MfaPhoneData = {
  id: string;
  label: string;
  isVerified: boolean;
};

export type MfaVerifyPhoneData = {
  id: string | undefined;
  requestKey?: string;
  canRun?: () => boolean;
  verification: VerificationCodeData;
  enableMfa: (canContinue?: () => boolean) => Promise<boolean | void>;
};

export type MFAVerifyPhoneProps = FormProps & {
  title: LocalizationKey;
  model: MfaVerifyPhoneData;
};

export type MfaPhoneCodeScreenData = {
  requestKey: string;
  canRun: () => boolean;
  selectPhone: (id: string) => boolean;
  enablePhone: (id: string | undefined, canContinue?: () => boolean) => Promise<boolean>;
  hasBackupCodes: boolean;
  hasNewBackupCodes: boolean;
  backupCodes: string[] | undefined;
  addPhone: AddPhoneData;
  verifyPhone: MfaVerifyPhoneData;
  addMfa: { hasUser: boolean; phones: MfaPhoneData[] };
};

export type EnableMFAButtonForPhoneViewData = {
  id: string;
  label: string;
  isLoading: boolean;
  isDisabled: boolean;
  enableMfa: () => Promise<void>;
};
