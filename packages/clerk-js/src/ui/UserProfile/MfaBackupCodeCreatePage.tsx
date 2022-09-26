import { BackupCodeResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../contexts';
import { localizationKeys, Spinner, Text } from '../customizables';
import { useCardState } from '../elements';
import { handleError } from '../utils';
import { FormButtonContainer } from './FormButtons';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';

export const MfaBackupCodeCreatePage = () => {
  const user = useCoreUser();
  const card = useCardState();
  const [backupCode, setBackupCode] = React.useState<BackupCodeResource | undefined>(undefined);

  const title = 'Add multi-factor authentication';
  const text =
    'Backup codes are now enabled. You can use one of these to sign in to your account, if you lose access to your authentication device. Each code can only be used once.';

  React.useEffect(() => {
    if (backupCode) {
      return;
    }

    void user
      .createBackupCode()
      .then((backupCode: BackupCodeResource) => setBackupCode(backupCode))
      .catch(err => handleError(err, [], card.setError));
  }, []);

  if (card.error) {
    return <ContentPage.Root headerTitle={title} />;
  }

  if (!backupCode) {
    return (
      <Spinner
        colorScheme='primary'
        size='lg'
      />
    );
  }

  return (
    <ContentPage.Root headerTitle={title}>
      <Text
        localizationKey={text}
        variant='regularRegular'
      />
      <MfaBackupCodeList backupCodes={backupCode.codes} />

      <FormButtonContainer>
        <NavigateToFlowStartButton
          variant='solid'
          autoFocus
          localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
        />
      </FormButtonContainer>
    </ContentPage.Root>
  );
};
