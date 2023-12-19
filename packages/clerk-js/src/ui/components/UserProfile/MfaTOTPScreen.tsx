import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { withCardStateProvider } from '../../elements';
import { AddAuthenticatorApp } from './AddAuthenticatorApp';
import { VerifyTOTP } from './VerifyTOTP';

type MfaTOTPFormProps = FormProps;
export const MfaTOTPScreen = withCardStateProvider((props: MfaTOTPFormProps) => {
  const { onSuccess, onReset } = props;
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
        onSuccess={onSuccess}
        onReset={onReset}
        resourceRef={ref}
      />
    </Wizard>
  );
});
