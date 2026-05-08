import { useLocalizations } from '@/customizables';

import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';
import { useWizard } from './elements/Wizard';

export const ConfigureSSOHeader = (): JSX.Element => {
  const { activeSteps, currentStep, goToStep } = useWizard();
  const { t } = useLocalizations();
  // Select Provider isn't part of the visual breadcrumb per the design —
  // filter it out here. The wizard still tracks it as the first step
  // for navigation (goNext from it advances to verify-domain, Previous
  // is naturally disabled because isFirstStep is true).
  const visibleSteps = activeSteps.filter(step => step.id !== 'select-provider');
  const currentIndex = visibleSteps.findIndex(step => step.id === currentStep?.id);

  return (
    <ProfileCardHeader>
      <Stepper>
        {visibleSteps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = step.isCompleted ?? index < currentIndex;
          const isReachable = isCompleted || index <= currentIndex;
          const labelText = step.label ? (typeof step.label === 'string' ? step.label : t(step.label)) : '';

          return (
            <Stepper.Item
              key={step.id}
              bullet={index + 1}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isReachable={isReachable}
              onClick={() => {
                if (isReachable) {
                  void goToStep(step.id);
                }
              }}
            >
              {labelText}
            </Stepper.Item>
          );
        })}
      </Stepper>
    </ProfileCardHeader>
  );
};
