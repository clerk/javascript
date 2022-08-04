import React from 'react';

import { useWizard, Wizard } from '../common';
import { withCardStateProvider } from '../elements';
import { AddAuthenticatorApp } from './AddAuthenticatorApp';
import { SuccessPage } from './SuccessPage';
import { VerifyTOTP } from './VerifyTOTP';

export const MfaTOTPPage = withCardStateProvider(() => {
  const title = 'Add authenticator app';
  const wizard = useWizard();

  return (
    <Wizard {...wizard.props}>
      <AddAuthenticatorApp
        title={title}
        onContinue={wizard.nextStep}
      />

      <VerifyTOTP
        title={title}
        onVerified={wizard.nextStep}
      />

      <SuccessPage
        title={title}
        text={`Multifactor authentication is now enabled. When signing in, you will need to enter a verification code from this authenticator as an additional step.`}
      />
    </Wizard>
  );
});
