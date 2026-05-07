import { Breadcrumbs } from './elements/Breadcrumbs';
import { ProfileCardHeader } from './elements/ProfileCard';
import { useWizard } from './elements/Wizard';

export const ConfigureSSOHeader = (): JSX.Element => {
  const { activeSteps, currentStep, goToStep } = useWizard();

  return (
    <ProfileCardHeader>
      <Breadcrumbs
        currentId={currentStep?.id}
        onItemClick={id => {
          void goToStep(id);
        }}
      >
        {activeSteps.map(step => (
          <Breadcrumbs.Item
            key={step.id}
            id={step.id}
            label={step.label}
            isCompleted={step.isCompleted}
          />
        ))}
      </Breadcrumbs>
    </ProfileCardHeader>
  );
};
