import { Icon, Text } from '@/customizables';
import { Check } from '@/icons';

import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';
import { useWizard } from './elements/Wizard';

export const ConfigureSSOHeader = (): JSX.Element => {
  const { activeSteps, currentStep, goToStep } = useWizard();
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
          const showCheck = isCompleted && !isCurrent;

          return (
            <Stepper.Item
              key={step.id}
              label={step.label}
              bullet={
                showCheck ? (
                  <Icon
                    icon={Check}
                    sx={theme => ({ width: theme.sizes.$2, height: theme.sizes.$2, color: theme.colors.$white })}
                  />
                ) : (
                  <Text
                    as='span'
                    sx={theme => ({
                      fontSize: theme.fontSizes.$xs,
                      fontWeight: theme.fontWeights.$semibold,
                      color: theme.colors.$colorBackground,
                    })}
                  >
                    {index + 1}
                  </Text>
                )
              }
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isReachable={isReachable}
              onClick={() => {
                if (isReachable) {
                  void goToStep(step.id);
                }
              }}
            />
          );
        })}
      </Stepper>
    </ProfileCardHeader>
  );
};
