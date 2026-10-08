import { useWizard } from '../../../elements/Wizard';
import { SamlMicrosoftAttributeMappingStepView } from './saml-microsoft-attribute-mapping-step.view';

export const SamlMicrosoftAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlMicrosoftAttributeMappingStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
