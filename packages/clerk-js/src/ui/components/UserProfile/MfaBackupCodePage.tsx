import React from 'react';

import { useWizard, Wizard } from '../../common';
import { Button, localizationKeys, Text } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { FormButtonContainer } from './FormButtons';
import { MfaBackupCodeCreatePage } from './MfaBackupCodeCreatePage';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './UserProfileContentPage';

export const MfaBackupCodePage = withCardStateProvider(() => {
  const wizard = useWizard();

  return (
    <Wizard {...wizard.props}>
      <AddBackupCode onContinue={wizard.nextStep} />

      <MfaBackupCodeCreatePage />
    </Wizard>
  );
});

type AddBackupCodeProps = {
  onContinue: () => void;
};

const AddBackupCode = (props: AddBackupCodeProps) => {
  const { onContinue } = props;

  return (
    <ContentPage headerTitle={localizationKeys('userProfile.backupCodePage.title')}>
      <Text localizationKey={localizationKeys('userProfile.backupCodePage.infoText1')} />
      <Text localizationKey={localizationKeys('userProfile.backupCodePage.infoText2')} />

      <FormButtonContainer sx={{ marginTop: 0 }}>
        <Button
          textVariant='buttonExtraSmallBold'
          onClick={onContinue}
          localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
        />

        <NavigateToFlowStartButton localizationKey={localizationKeys('userProfile.formButtonReset')} />
      </FormButtonContainer>
    </ContentPage>
  );
};
