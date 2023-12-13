import { useUser } from '@clerk/shared/react';
import type { VerificationStrategy } from '@clerk/types';
import React from 'react';

import { useEnvironment } from '../../contexts';
import { Col, Grid, localizationKeys, Text } from '../../customizables';
import {
  FormButtonContainer,
  FormContent,
  NavigateToFlowStartButton,
  TileButton,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { AuthApp, DotCircle, Mobile } from '../../icons';
import { mqu } from '../../styledSystem';
import { MfaBackupCodePage } from './MfaBackupCodePage';
import { MfaPhoneCodePage } from './MfaPhoneCodePage';
import { MfaTOTPPage } from './MfaTOTPPage';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';
import { getSecondFactorsAvailableToAdd } from './utils';

export const MfaPage = withCardStateProvider(() => {
  const card = useCardState();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const { user } = useUser();

  if (!user) {
    return null;
  }

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
    return (
      <FormContent
        headerTitle={title}
        Breadcrumbs={UserProfileBreadcrumbs}
      />
    );
  }

  // If there is only an available method or one has been selected, render the dedicated page instead
  if (secondFactorsAvailableToAdd.length === 1 || selectedMethod) {
    return <MfaPageIfSingleOrCurrent method={selectedMethod || secondFactorsAvailableToAdd[0]} />;
  }

  return (
    <FormContent
      headerTitle={title}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Col gap={4}>
        <Text localizationKey={localizationKeys('userProfile.mfaPage.formHint')} />
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
          {secondFactorsAvailableToAdd.map((method, i) => (
            <MfaAvailableMethodToAdd
              method={method}
              setSelectedMethod={setSelectedMethod}
              key={i}
            />
          ))}
        </Grid>
      </Col>

      <FormButtonContainer sx={{ marginTop: 0 }}>
        <NavigateToFlowStartButton localizationKey={localizationKeys('userProfile.formButtonReset')} />
      </FormButtonContainer>
    </FormContent>
  );
});

type MfaPageIfSingleOrCurrentProps = {
  method: string;
};

const MfaPageIfSingleOrCurrent = (props: MfaPageIfSingleOrCurrentProps) => {
  const { method } = props;

  switch (method) {
    case 'phone_code':
      return <MfaPhoneCodePage />;
    case 'totp':
      return <MfaTOTPPage />;
    case 'backup_code':
      return <MfaBackupCodePage />;
    default:
      return null;
  }
};

type MfaAvailableMethodToAddProps = {
  method: string;
  setSelectedMethod: (method: VerificationStrategy | undefined) => void;
};

const MfaAvailableMethodToAdd = (props: MfaAvailableMethodToAddProps) => {
  const { method, setSelectedMethod } = props;

  let icon: React.ComponentType;
  let text: string;
  if (method === 'phone_code') {
    icon = Mobile;
    text = 'SMS code';
  } else if (method === 'totp') {
    icon = AuthApp;
    text = 'Authenticator application';
  } else if (method === 'backup_code') {
    icon = DotCircle;
    text = 'Backup code';
  } else {
    return null;
  }

  return (
    <TileButton
      icon={icon}
      onClick={() => setSelectedMethod(method)}
    >
      {text}
    </TileButton>
  );
};
