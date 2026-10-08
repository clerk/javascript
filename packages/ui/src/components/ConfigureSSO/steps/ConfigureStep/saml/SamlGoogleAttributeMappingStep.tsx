import { useWizard } from '../../../elements/Wizard';
import { SamlGoogleAttributeMappingStepView } from './saml-google-attribute-mapping-step.view';

export const SamlGoogleAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlGoogleAttributeMappingStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
