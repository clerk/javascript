import { useLocalizations } from '@/customizables';

import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';
import { useWizard } from './elements/Wizard';

export const ConfigureSSOHeader = (): JSX.Element => {
  const { activeSteps, currentStep, goToStep } = useWizard();
  const { t } = useLocalizations();

  // `select-provider` is only mounted while there's no enterprise connection,
  // but per design it should never appear in the visual breadcrumb regardless,
  // so we always filter it out here
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
              onClick={() => void goToStep(step.id)}
            >
              {labelText}
            </Stepper.Item>
          );
        })}
      </Stepper>
    </ProfileCardHeader>
  );
};
