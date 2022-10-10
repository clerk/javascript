import React from 'react';

import { useWizard, Wizard } from '../../common';
import { Button, Text } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { FormButtonContainer } from './FormButtons';
import { MfaBackupCodeCreatePage } from './MfaBackupCodeCreatePage';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';

export const MfaBackupCodePage = withCardStateProvider(() => {
  const wizard = useWizard();

  return (
    <Wizard {...wizard.props}>
      <AddBackupCode
        title='Add backup code verification'
        onContinue={wizard.nextStep}
      />

      <MfaBackupCodeCreatePage />
    </Wizard>
  );
});

type AddBackupCodeProps = {
  title: string;
  onContinue: () => void;
};

const AddBackupCode = (props: AddBackupCodeProps) => {
  const { title, onContinue } = props;

  return (
    <ContentPage.Root headerTitle={title}>
      <Text>Backup codes will be enabled for this account.</Text>
      <Text>
        Keep the backup codes secret and store them securely. You may regenerate backup codes if you suspect they have
        been compromised.
      </Text>
      <FormButtonContainer sx={{ marginTop: 0 }}>
        <Button
          textVariant='buttonExtraSmallBold'
          onClick={onContinue}
        >
          Continue
        </Button>

        <NavigateToFlowStartButton>Cancel</NavigateToFlowStartButton>
      </FormButtonContainer>
    </ContentPage.Root>
  );
};
