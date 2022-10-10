import { TOTPResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { withCardStateProvider } from '../../elements';
import { AddAuthenticatorApp } from './AddAuthenticatorApp';
import { SuccessPage } from './SuccessPage';
import { VerifyTOTP } from './VerifyTOTP';

export const MfaTOTPPage = withCardStateProvider(() => {
  const title = 'Add authenticator application';
  const wizard = useWizard();
  const ref = React.useRef<TOTPResource>();

  return (
    <Wizard {...wizard.props}>
      <AddAuthenticatorApp
        title={title}
        onContinue={wizard.nextStep}
      />

      <VerifyTOTP
        title={title}
        onVerified={wizard.nextStep}
        resourceRef={ref}
      />

      <SuccessPage
        title={title}
        text={`Two-step verification is now enabled. When signing in, you will need to enter a verification code from this authenticator as an additional step.`}
        backupCodes={ref.current?.backupCodes}
      />
    </Wizard>
  );
});
