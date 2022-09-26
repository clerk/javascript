import { VerificationStrategy } from '@clerk/types';
import React from 'react';

import { useCoreUser, useEnvironment } from '../contexts';
import { Col, Grid, localizationKeys, Text } from '../customizables';
import { TileButton, useCardState, withCardStateProvider } from '../elements';
import { AuthApp, DotCircle, Mobile } from '../icons';
import { mqu } from '../styledSystem';
import { FormButtonContainer } from './FormButtons';
import { MfaBackupCodePage } from './MfaBackupCodePage';
import { MfaPhoneCodePage } from './MfaPhoneCodePage';
import { MfaTOTPPage } from './MfaTOTPPage';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';
import { getSecondFactorsAvailableToAdd } from './utils';

export const MfaPage = withCardStateProvider(() => {
  const card = useCardState();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const user = useCoreUser();
  const title = localizationKeys('userProfile.mfaPage.title');
  const [selectedMethod, setSelectedMethod] = React.useState<VerificationStrategy>();

  // Calculate second factors available to add on first use only
  const secondFactorsAvailableToAdd = React.useMemo(() => getSecondFactorsAvailableToAdd(attributes, user), []);

  React.useEffect(() => {
    if (secondFactorsAvailableToAdd.length === 0) {
      card.setError('There are no second factors available to add');
    }
  }, []);

  if (card.error) {
    return <ContentPage.Root headerTitle={title} />;
  }

  // If only phone_code is available, just render that
  // Otherwise check if selected
  if (
    (secondFactorsAvailableToAdd.length === 1 && secondFactorsAvailableToAdd[0] === 'phone_code') ||
    selectedMethod === 'phone_code'
  ) {
    return <MfaPhoneCodePage />;
  }

  // If only totp is available, just render that
  // Otherwise check if selected
  if (
    (secondFactorsAvailableToAdd.length === 1 && secondFactorsAvailableToAdd[0] === 'totp') ||
    selectedMethod === 'totp'
  ) {
    return <MfaTOTPPage />;
  }

  // If only backup_code is available, just render that. Otherwise, check if selected
  if (
    (secondFactorsAvailableToAdd.length === 1 && secondFactorsAvailableToAdd[0] === 'backup_code') ||
    selectedMethod === 'backup_code'
  ) {
    return <MfaBackupCodePage />;
  }

  return (
    <ContentPage.Root headerTitle={title}>
      <Col gap={4}>
        <Text>Select a method to add.</Text>
        <Grid
          gap={2}
          sx={t => ({
            gridTemplateColumns: `repeat(3, minmax(${t.sizes.$24}, 1fr))`,
            gridAutoRows: t.sizes.$24,
            [mqu.sm]: {
              gridTemplateColumns: `repeat(2, minmax(${t.sizes.$24}, 1fr))`,
            },
          })}
        >
          {secondFactorsAvailableToAdd.includes('totp') && (
            <TileButton
              icon={AuthApp}
              onClick={() => setSelectedMethod('totp')}
            >
              Authenticator application
            </TileButton>
          )}

          {secondFactorsAvailableToAdd.includes('phone_code') && (
            <TileButton
              icon={Mobile}
              onClick={() => setSelectedMethod('phone_code')}
            >
              SMS code
            </TileButton>
          )}

          {secondFactorsAvailableToAdd.includes('backup_code') && (
            <TileButton
              icon={DotCircle}
              onClick={() => setSelectedMethod('backup_code')}
            >
              Backup code
            </TileButton>
          )}
        </Grid>
      </Col>

      <FormButtonContainer sx={{ marginTop: 0 }}>
        <NavigateToFlowStartButton>Cancel</NavigateToFlowStartButton>
      </FormButtonContainer>
    </ContentPage.Root>
  );
});
