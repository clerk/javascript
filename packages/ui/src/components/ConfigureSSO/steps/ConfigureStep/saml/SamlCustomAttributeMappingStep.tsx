import { useWizard } from '../../../elements/Wizard';
import { SamlCustomAttributeMappingStepView } from './saml-custom-attribute-mapping-step.view';

export const SamlCustomAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlCustomAttributeMappingStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
