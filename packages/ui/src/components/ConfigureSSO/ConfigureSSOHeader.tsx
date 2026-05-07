import { Icon, Text } from '@/customizables';
import { Check } from '@/icons';

import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';
import { useWizard } from './elements/Wizard';

export const ConfigureSSOHeader = (): JSX.Element => {
  const { activeSteps, currentStep, goToStep } = useWizard();
  const currentIndex = activeSteps.findIndex(s => s.id === currentStep?.id);

  return (
    <ProfileCardHeader>
      <Stepper>
        {activeSteps.map((step, index) => {
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
