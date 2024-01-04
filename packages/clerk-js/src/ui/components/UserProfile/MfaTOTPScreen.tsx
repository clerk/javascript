import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { SuccessPage, withCardStateProvider } from '../../elements';
import { AddAuthenticatorApp } from './AddAuthenticatorApp';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { VerifyTOTP } from './VerifyTOTP';

type MfaTOTPFormProps = FormProps;
export const MfaTOTPScreen = withCardStateProvider((props: MfaTOTPFormProps) => {
  const { onReset } = props;
  const wizard = useWizard();
  const ref = React.useRef<TOTPResource>();

  return (
    <Wizard {...wizard.props}>
      <AddAuthenticatorApp
        title={localizationKeys('userProfile.security.mfaSection.mfaTOTPScreen.title')}
        onSuccess={wizard.nextStep}
        onReset={onReset}
      />

      <VerifyTOTP
        onSuccess={wizard.nextStep}
        onReset={onReset}
        resourceRef={ref}
      />

      <SuccessPage
        title={localizationKeys('userProfile.security.mfaSection.mfaTOTPScreen.title')}
        text={localizationKeys('userProfile.security.mfaSection.mfaTOTPScreen.successMessage')}
        contents={
          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.security.mfaSection.backupCodeScreen.successSubtitle')}
            backupCodes={ref.current?.backupCodes}
          />
        }
      />
    </Wizard>
  );
});
