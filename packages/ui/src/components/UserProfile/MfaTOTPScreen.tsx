import type { TOTPResource } from '@clerk/shared/types';
import React from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';
import { SuccessPage } from '@/ui/elements/SuccessPage';

import { useWizard, Wizard } from '../../common';
import { localizationKeys } from '../../customizables';
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
        title={localizationKeys('userProfile.mfaTOTPPage.title')}
        onSuccess={wizard.nextStep}
        onReset={onReset}
      />

      <VerifyTOTP
        onSuccess={wizard.nextStep}
        onReset={onReset}
        resourceRef={ref}
      />

      <SuccessPage
        title={localizationKeys('userProfile.mfaTOTPPage.title')}
        text={localizationKeys('userProfile.mfaTOTPPage.successMessage')}
        onFinish={onReset}
        contents={
          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.backupCodePage.successSubtitle')}
            backupCodes={ref.current?.backupCodes}
          />
        }
      />
    </Wizard>
  );
});
