import { useWizard } from '../../../elements/Wizard';
import { SamlOktaAttributeMappingStepView } from './saml-okta-attribute-mapping-step.view';

export const SamlOktaAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlOktaAttributeMappingStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
