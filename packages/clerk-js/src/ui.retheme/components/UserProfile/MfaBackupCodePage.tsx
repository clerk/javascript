import { useWizard, Wizard } from '../../common';
import { Button, descriptors, localizationKeys, Text } from '../../customizables';
import { ContentPage, FormButtonContainer, NavigateToFlowStartButton, withCardStateProvider } from '../../elements';
import { MfaBackupCodeCreatePage } from './MfaBackupCodeCreatePage';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

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
    <ContentPage
      headerTitle={localizationKeys('userProfile.backupCodePage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Text localizationKey={localizationKeys('userProfile.backupCodePage.infoText1')} />
      <Text localizationKey={localizationKeys('userProfile.backupCodePage.infoText2')} />

      <FormButtonContainer sx={{ marginTop: 0 }}>
        <Button
          textVariant='buttonSmall'
          onClick={onContinue}
          localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
          elementDescriptor={descriptors.formButtonPrimary}
        />

        <NavigateToFlowStartButton
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
        />
      </FormButtonContainer>
    </ContentPage>
  );
};
