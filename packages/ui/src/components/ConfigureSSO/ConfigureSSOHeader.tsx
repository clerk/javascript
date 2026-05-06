import { Breadcrumbs } from './elements/Breadcrumbs';
import { useWizard } from './elements/Wizard';

/**
 * Renders the wizard's active steps as a numbered breadcrumb. Sits
 * above the body in the ConfigureSSO layout. Reads navigation state
 * from `useWizard()` and feeds the data declaratively into the
 * `<Breadcrumbs>` primitive
 */
export const ConfigureSSOHeader = (): JSX.Element => {
  const { activeSteps, currentStep, goToStep } = useWizard();

  return (
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
  );
};
