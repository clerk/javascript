import { useWizard } from '../../../elements/Wizard';
import { SamlOktaAssignUsersStepView } from './saml-okta-assign-users-step.view';

export const SamlOktaAssignUsersStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlOktaAssignUsersStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
