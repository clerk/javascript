import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { localizationKeys } from '../../customizables';
import { SuccessPage, withCardStateProvider } from '../../elements';
import { AddAuthenticatorApp } from './AddAuthenticatorApp';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';
import { VerifyTOTP } from './VerifyTOTP';

export const MfaTOTPPage = withCardStateProvider(() => {
  const wizard = useWizard();
  const ref = React.useRef<TOTPResource>();

  return (
    <Wizard {...wizard.props}>
      <AddAuthenticatorApp
        title={localizationKeys('userProfile.mfaTOTPPage.title')}
        onContinue={wizard.nextStep}
      />

      <VerifyTOTP
        onVerified={wizard.nextStep}
        resourceRef={ref}
      />

      <SuccessPage
        title={localizationKeys('userProfile.mfaTOTPPage.title')}
        text={localizationKeys('userProfile.mfaTOTPPage.successMessage')}
        contents={
          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.backupCodePage.successSubtitle')}
            backupCodes={ref.current?.backupCodes}
          />
        }
        Breadcrumbs={UserProfileBreadcrumbs}
      />
    </Wizard>
  );
});
