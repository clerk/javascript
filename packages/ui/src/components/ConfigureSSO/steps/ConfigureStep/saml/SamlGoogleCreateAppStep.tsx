import { useWizard } from '../../../elements/Wizard';
import { SamlGoogleCreateAppStepView } from './saml-google-create-app-step.view';

export const SamlGoogleCreateAppStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlGoogleCreateAppStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
