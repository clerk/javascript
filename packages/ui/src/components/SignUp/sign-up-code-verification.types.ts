import type { CodePreparationCommands, CodeSubmissionCommands } from '../../common/code-verification.types';
import type { LocalizationKey } from '../../customizables';
import type { VerificationCodeCardProps } from '../../elements/VerificationCodeCard';

type SignUpCodeData = CodePreparationCommands &
  CodeSubmissionCommands & {
    goBack: () => Promise<unknown>;
  };

export type SignUpEmailCodeData = SignUpCodeData & { emailAddress: string | null };

export type SignUpPhoneCodeData = SignUpCodeData & {
  cardTitleKey: LocalizationKey;
  cardSubtitleKey: LocalizationKey;
  resendButtonKey: LocalizationKey;
  prepareSMSRequest: () => Promise<void>;
  phoneNumber: string | null;
  isAlternativePhoneCodeProvider: boolean;
};

export type SignUpEmailCodeViewProps = Pick<SignUpEmailCodeData, 'emailAddress' | 'goBack'> & {
  action: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  prepare: () => Promise<void> | undefined;
};

export type SignUpPhoneCodeViewProps = Pick<
  SignUpPhoneCodeData,
  'cardTitleKey' | 'cardSubtitleKey' | 'resendButtonKey' | 'goBack' | 'phoneNumber' | 'isAlternativePhoneCodeProvider'
> & {
  action: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  prepare: () => Promise<void> | undefined;
  prepareWithSMS: () => void;
  isLoading: boolean;
};
