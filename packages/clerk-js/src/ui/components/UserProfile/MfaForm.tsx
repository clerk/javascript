import { useUser } from '@clerk/shared/react';
import type { VerificationStrategy } from '@clerk/types';
import React from 'react';

import { useEnvironment } from '../../contexts';
import { Button, Col, Grid, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import { FormButtonContainer, FormContainer, TileButton, useCardState, withCardStateProvider } from '../../elements';
import { AuthApp, DotCircle, Mobile } from '../../icons';
import { mqu } from '../../styledSystem';
import { MfaBackupCodeScreen } from './MfaBackupCodeScreen';
import { MfaPhoneCodeScreen } from './MfaPhoneCodeScreen';
import { MfaTOTPScreen } from './MfaTOTPScreen';
import { getSecondFactorsAvailableToAdd } from './utils';

type MfaFormProps = FormProps;
export const MfaForm = withCardStateProvider((props: MfaFormProps) => {
  const { onSuccess, onReset } = props;
  const card = useCardState();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const title = localizationKeys('userProfile.security.mfaSection.mfaScreen.title');
  const [selectedMethod, setSelectedMethod] = React.useState<VerificationStrategy>();

  // Calculate second factors available to add on first use only
  const secondFactorsAvailableToAdd = React.useMemo(() => getSecondFactorsAvailableToAdd(attributes, user), []);

  React.useEffect(() => {
    if (secondFactorsAvailableToAdd.length === 0) {
      card.setError('There are no second factors available to add');
    }
  }, []);

  if (card.error) {
    return <FormContainer headerTitle={title} />;
  }

  // If there is only an available method or one has been selected, render the dedicated page instead
  if (secondFactorsAvailableToAdd.length === 1 || selectedMethod) {
    return (
      <MfaPageIfSingleOrCurrent
        onSuccess={onSuccess}
        onReset={onReset}
        method={selectedMethod || secondFactorsAvailableToAdd[0]}
      />
    );
  }

  return (
    <FormContainer headerTitle={title}>
      <Col gap={4}>
        <Text localizationKey={localizationKeys('userProfile.security.mfaSection.mfaScreen.formHint')} />
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
        <Button
          variant='ghost'
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          onClick={onReset}
        />
      </FormButtonContainer>
    </FormContainer>
  );
});

type MfaPageIfSingleOrCurrentProps = FormProps & {
  method: string;
};

const MfaPageIfSingleOrCurrent = (props: MfaPageIfSingleOrCurrentProps) => {
  const { method, onSuccess, onReset } = props;

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
