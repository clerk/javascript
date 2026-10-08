import type { FormEvent, MouseEventHandler } from 'react';

import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '@/ui/localization';
import type { FormControlState } from '@/ui/utils/useFormControl';

import type { VerificationCodeData } from './verification-code.types';

export type PhoneFormProps = FormProps & {
  phoneId?: string;
};

export type AddPhoneData = {
  requestKey?: string;
  canRun?: () => boolean;
  username: string | null | undefined;
  hasExistingNumber: boolean;
  createPhone: (phoneNumber: string, canContinue?: () => boolean) => Promise<boolean>;
};

export type AddPhoneOptions = FormProps & {
  title: LocalizationKey;
  onUseExistingNumberClick?: MouseEventHandler;
};

export type AddPhoneProps = AddPhoneOptions & {
  model: AddPhoneData;
};

export type VerifyPhoneProps = FormProps & {
  title: LocalizationKey;
  verification: VerificationCodeData;
};

export type PhoneFormData = {
  requestKey: string;
  hasExistingPhone: boolean;
  addPhone: AddPhoneData;
  verification: VerificationCodeData;
};

export type AddPhoneViewData = {
  title: LocalizationKey;
  phoneField: Pick<FormControlState<'phoneNumber'>, 'id' | 'props'>;
  canSubmit: boolean;
  hasExistingNumber: boolean;
  onUseExistingNumberClick?: MouseEventHandler;
  onReset: () => void;
  addPhone: (event: FormEvent) => Promise<void>;
};
