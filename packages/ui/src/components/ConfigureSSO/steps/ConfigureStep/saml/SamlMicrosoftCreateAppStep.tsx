import { useWizard } from '../../../elements/Wizard';
import { SamlMicrosoftCreateAppStepView } from './saml-microsoft-create-app-step.view';

export const SamlMicrosoftCreateAppStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlMicrosoftCreateAppStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
