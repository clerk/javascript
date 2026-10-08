import { useWizard } from '../../../elements/Wizard';
import { SamlGoogleConfigureUserAccessStepView } from './saml-google-configure-user-access-step.view';

export const SamlGoogleConfigureUserAccessStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlGoogleConfigureUserAccessStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
