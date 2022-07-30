import { VerificationStrategy } from '@clerk/types';
import React from 'react';

import { useCoreUser, useEnvironment } from '../../ui/contexts';
import { Col, Grid, Text } from '../customizables';
import { useCardState, withCardStateProvider } from '../elements';
import { AuthenticatorApp, Mobile } from '../icons';
import { FormButtonContainer } from './FormButtons';
import { MfaPhoneCodePage } from './MfaPhoneCodePage';
import { MfaTOTPPage } from './MfaTOTPPage';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';
import { TileButton } from './TileButton';
import { getSecondFactors } from './utils';

export const MfaPage = withCardStateProvider(() => {
  const card = useCardState();
  const { attributes } = useEnvironment().userSettings;
  const user = useCoreUser();
  const title = 'Add multifactor authentication';
  const [selectedMethod, setSelectedMethod] = React.useState<VerificationStrategy | undefined>(undefined);

  // Calculate second factors on first use only
  const secondFactors = React.useMemo<string[]>(() => {
    let sfs = getSecondFactors(attributes);

    // If user.totp_enabled, skip totp from the list of choices
    if (user.totpEnabled) {
      sfs = sfs.filter(f => f !== 'totp');
    }

    return sfs;
  }, []);

  if (secondFactors.length == 0) {
    card.setError('There are no enabled second factors');

    return <ContentPage.Root headerTitle={title} />;
  }

  // If only phone_code is available, just render that
  // Otherwise check if selected
  if ((secondFactors.length == 1 && secondFactors[0] == 'phone_code') || selectedMethod === 'phone_code') {
    return <MfaPhoneCodePage />;
  }

  // If only totp is available, just render that
  // Otherwise check if selected
  if ((secondFactors.length == 1 && secondFactors[0] == 'totp') || selectedMethod === 'totp') {
    return <MfaTOTPPage />;
  }

  return (
    <ContentPage.Root headerTitle={title}>
      <Col gap={4}>
        <Text>Select a method to add.</Text>

        <Grid
          columns={3}
          gap={2}
        >
          <TileButton
            icon={AuthenticatorApp}
            onClick={() => setSelectedMethod('totp')}
            sx={{ height: '96px' }}
          >
            Authenticator application
          </TileButton>

          <TileButton
            icon={Mobile}
            onClick={() => setSelectedMethod('phone_code')}
            sx={{ height: '96px' }}
          >
            SMS code
          </TileButton>
        </Grid>
      </Col>

      <FormButtonContainer sx={{ marginTop: 0 }}>
        <NavigateToFlowStartButton>Cancel</NavigateToFlowStartButton>
      </FormButtonContainer>
    </ContentPage.Root>
  );
});
