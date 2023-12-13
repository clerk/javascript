import { useUser } from '@clerk/shared/react';
import type { BackupCodeResource } from '@clerk/types';
import React from 'react';

import { descriptors, localizationKeys, Text } from '../../customizables';
import {
  ContentPage,
  FormButtonContainer,
  FullHeightLoader,
  NavigateToFlowStartButton,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { handleError } from '../../utils';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const MfaBackupCodeCreatePage = withCardStateProvider(() => {
  const { user } = useUser();
  const card = useCardState();
  const [backupCode, setBackupCode] = React.useState<BackupCodeResource | undefined>(undefined);

  React.useEffect(() => {
    if (backupCode) {
      return;
    }

    void user
      ?.createBackupCode()
      .then((backupCode: BackupCodeResource) => setBackupCode(backupCode))
      .catch(err => handleError(err, [], card.setError));
  }, []);

  if (card.error) {
    return (
      <ContentPage
        headerTitle={localizationKeys('userProfile.backupCodePage.title')}
        Breadcrumbs={UserProfileBreadcrumbs}
      />
    );
  }

  return (
    <ContentPage
      headerTitle={localizationKeys('userProfile.backupCodePage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      {!backupCode ? (
        <FullHeightLoader />
      ) : (
        <>
          <Text localizationKey={localizationKeys('userProfile.backupCodePage.successMessage')} />

          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.backupCodePage.subtitle__codelist')}
            backupCodes={backupCode.codes}
          />

          <FormButtonContainer>
            <NavigateToFlowStartButton
              autoFocus
              localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
              elementDescriptor={descriptors.formButtonPrimary}
            />
          </FormButtonContainer>
        </>
      )}
    </ContentPage>
  );
});
