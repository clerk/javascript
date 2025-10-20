import { useUser } from '@clerk/shared/react';
import type { VerificationStrategy } from '@clerk/shared/types';
import React from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';

import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { MfaBackupCodeScreen } from './MfaBackupCodeScreen';
import { MfaPhoneCodeScreen } from './MfaPhoneCodeScreen';
import { MfaTOTPScreen } from './MfaTOTPScreen';
import { getSecondFactorsAvailableToAdd } from './utils';

type MfaFormProps = FormProps & {
  selectedStrategy?: VerificationStrategy;
};
export const MfaForm = withCardStateProvider((props: MfaFormProps) => {
  const { onSuccess, onReset, selectedStrategy = undefined } = props;
  const card = useCardState();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const title = localizationKeys('userProfile.mfaPage.title');

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

  if (secondFactorsAvailableToAdd.length === 0 && !selectedStrategy) {
    return null;
  }

  // If there is only an available method or one has been selected, render the dedicated page instead
  return (
    <MfaPageIfSingleOrCurrent
      onSuccess={onSuccess}
      onReset={onReset}
      method={selectedStrategy || secondFactorsAvailableToAdd[0]}
    />
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
