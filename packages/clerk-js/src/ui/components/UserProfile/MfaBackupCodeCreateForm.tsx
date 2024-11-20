import { __experimental_useReverification as useReverification, useUser } from '@clerk/shared/react';
import type { BackupCodeResource } from '@clerk/types';
import React from 'react';

import { Button, descriptors, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import {
  FormButtonContainer,
  FormContainer,
  FullHeightLoader,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { handleError } from '../../utils';
import { MfaBackupCodeList } from './MfaBackupCodeList';

type MfaBackupCodeCreateFormProps = FormProps;
export const MfaBackupCodeCreateForm = withCardStateProvider((props: MfaBackupCodeCreateFormProps) => {
  const { onSuccess } = props;
  const { user } = useUser();
  const card = useCardState();
  const [createBackupCode] = useReverification(() => user?.createBackupCode());
  const [backupCode, setBackupCode] = React.useState<BackupCodeResource | undefined>(undefined);

  React.useEffect(() => {
    if (backupCode || !user) {
      return;
    }

    void createBackupCode()
      .then(backupCode => setBackupCode(backupCode))
      .catch(err => handleError(err, [], card.setError));
  }, []);

  if (card.error) {
    return <FormContainer headerTitle={localizationKeys('userProfile.backupCodePage.title')} />;
  }

  return (
    <FormContainer headerTitle={localizationKeys('userProfile.backupCodePage.title')}>
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
            <Button
              autoFocus
              onClick={onSuccess}
              localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
              elementDescriptor={descriptors.formButtonPrimary}
            />
          </FormButtonContainer>
        </>
      )}
    </FormContainer>
  );
});
