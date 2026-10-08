import { Button, descriptors, localizationKeys, Text } from '@/ui/customizables';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';

import type { useMfaBackupCodeCreateController } from './mfa-backup-code-create.controller';
import { MfaBackupCodeList } from './MfaBackupCodeList';

export const MfaBackupCodeCreateView = ({
  controller,
}: {
  controller: ReturnType<typeof useMfaBackupCodeCreateController>;
}) => {
  if (controller.hasError) {
    return <FormContainer headerTitle={localizationKeys('userProfile.backupCodePage.title')} />;
  }

  return (
    <FormContainer headerTitle={localizationKeys('userProfile.backupCodePage.title')}>
      {!controller.backupCode ? (
        <FullHeightLoader />
      ) : (
        <>
          <Text localizationKey={localizationKeys('userProfile.backupCodePage.successMessage')} />

          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.backupCodePage.subtitle__codelist')}
            backupCodes={controller.backupCode.codes}
          />

          <FormButtonContainer>
            <Button
              autoFocus={controller.autoFocus}
              onClick={controller.onSuccess}
              localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
              elementDescriptor={descriptors.formButtonPrimary}
            />
          </FormButtonContainer>
        </>
      )}
    </FormContainer>
  );
};
