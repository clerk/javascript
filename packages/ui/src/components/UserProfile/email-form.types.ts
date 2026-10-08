import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '@/ui/localization';

import type { VerificationCodeData } from './verification-code.types';

export type EmailFormProps = FormProps & {
  emailId?: string;
  title?: LocalizationKey;
  subtitle?: LocalizationKey;
  disableAutoFocus?: boolean;
};

export type EmailVerificationFlow = {
  start: () => Promise<boolean | void>;
  cancel: () => void;
  open?: () => Promise<void>;
};

export type EmailVerificationProps = {
  requestKey?: string;
  canRun?: () => boolean;
  createFlow: (canContinue?: () => boolean) => EmailVerificationFlow;
  onReset: () => void;
  nextStep: () => void;
};

export type EmailVerificationViewData = {
  startVerification: () => void;
  openVerification: () => Promise<void>;
  onReset: () => void;
};

export type EmailFormData = {
  requestKey: string;
  canRun: () => boolean;
  verification: VerificationCodeData;
  identifier: string;
  hasExistingEmail: boolean;
  strategy: 'email_code' | 'email_link' | 'enterprise_sso';
  username: string | null | undefined;
  createEmail: (email: string, canContinue?: () => boolean) => Promise<boolean>;
  createEmailLinkFlow: (canContinue?: () => boolean) => EmailVerificationFlow;
  createEnterpriseSSOLinkFlow: (canContinue?: () => boolean) => EmailVerificationFlow;
};
