import { isReverificationCancelledError } from '@clerk/shared/error';
import { useReverification, useUser } from '@clerk/shared/react';
import type { BackupCodeResource } from '@clerk/shared/types';
import React from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';
import { handleError } from '@/ui/utils/errorHandler';

import { Button, descriptors, localizationKeys, Text } from '../../customizables';
import { MfaBackupCodeList } from './MfaBackupCodeList';

type MfaBackupCodeCreateFormProps = FormProps;
export const MfaBackupCodeCreateForm = withCardStateProvider((props: MfaBackupCodeCreateFormProps) => {
  const { onSuccess, onReset } = props;
  const { user } = useUser();
  const card = useCardState();
  const createBackupCode = useReverification(() => user?.createBackupCode());
  const [backupCode, setBackupCode] = React.useState<BackupCodeResource | undefined>(undefined);

  React.useEffect(() => {
    if (backupCode || !user) {
      return;
    }

    void createBackupCode()
      .then(backupCode => setBackupCode(backupCode))
      .catch(err => {
        if (isReverificationCancelledError(err)) {
          return onReset();
        }

        handleError(err, [], card.setError);
      });
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
