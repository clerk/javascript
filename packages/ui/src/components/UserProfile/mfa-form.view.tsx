import { localizationKeys } from '@/ui/customizables';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';

import { MfaBackupCodeScreen } from './MfaBackupCodeScreen';
import { MfaPhoneCodeScreen } from './MfaPhoneCodeScreen';
import { MfaTOTPScreen } from './MfaTOTPScreen';

type MfaFormViewProps = FormProps & {
  hasError: boolean;
  method: VerificationStrategy | undefined;
};

export const MfaFormView = ({ hasError, method, onSuccess, onReset }: MfaFormViewProps) => {
  const title = localizationKeys('userProfile.mfaPage.title');

  if (hasError) {
    return <FormContainer headerTitle={title} />;
  }

  if (!method) {
    return null;
  }

  // If there is only an available method or one has been selected, render the dedicated page instead
  switch (method) {
    case 'phone_code':
      return (
        <MfaPhoneCodeScreen
          onSuccess={onSuccess}
          onReset={onReset}
        />
      );
    case 'totp':
      return (
        <MfaTOTPScreen
          onSuccess={onSuccess}
          onReset={onReset}
        />
      );
    case 'backup_code':
      return (
        <MfaBackupCodeScreen
          onSuccess={onSuccess}
          onReset={onReset}
        />
      );
    default:
      return null;
  }
};
import type { VerificationStrategy } from '@clerk/shared/types';
