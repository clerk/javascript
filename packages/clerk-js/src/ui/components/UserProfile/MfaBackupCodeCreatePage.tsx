import { BackupCodeResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { FullHeightLoader, useCardState } from '../../elements';
import { handleError } from '../../utils';
import { FormButtonContainer } from './FormButtons';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './UserProfileContentPage';

export const MfaBackupCodeCreatePage = () => {
  const user = useCoreUser();
  const card = useCardState();
  const [backupCode, setBackupCode] = React.useState<BackupCodeResource | undefined>(undefined);

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
    return <ContentPage headerTitle={localizationKeys('userProfile.backupCodePage.title')} />;
  }

  return (
    <ContentPage headerTitle={localizationKeys('userProfile.backupCodePage.title')}>
      {!backupCode ? (
        <FullHeightLoader />
      ) : (
        <>
          <Text
            localizationKey={localizationKeys('userProfile.backupCodePage.successMessage')}
            variant='regularRegular'
          />

          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.backupCodePage.subtitle__codelist')}
            backupCodes={backupCode.codes}
          />

          <FormButtonContainer>
            <NavigateToFlowStartButton
              variant='solid'
              autoFocus
              localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
            />
          </FormButtonContainer>
        </>
      )}
    </ContentPage>
  );
};
