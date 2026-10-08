import { useWizard } from '../../../elements/Wizard';
import { SamlCustomAssignUsersStepView } from './saml-custom-assign-users-step.view';

export const SamlCustomAssignUsersStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <SamlCustomAssignUsersStepView
      goNext={goNext}
      goPrev={goPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  );
};
