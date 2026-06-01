import { useLocalizations } from '@/customizables';

import { useConfigureSSO } from './ConfigureSSOContext';
import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';
import { useWizardMachine } from './elements/WizardMachineContext';
import { STEPS } from './machine/transitions';

/**
 * The wizard breadcrumb, driven by the pure state machine + transitions.
 *
 * Visible steps are the enabled steps for the current facts, minus
 * `select-provider` (per design it never appears in the breadcrumb, even while
 * it's an active step). Completion stays positional — exactly as the legacy
 * `useWizard()`-backed header computed it (`index < currentIndex`) — so the
 * breadcrumb's visual completion state is behavior-equivalent. The current step
 * is `machine.current`; clicking a reachable item jumps via `GOTO`.
 */
export const ConfigureSSOHeader = (): JSX.Element => {
  const { facts } = useConfigureSSO();
  const { current, dispatch } = useWizardMachine();
  const { t } = useLocalizations();

  const visibleSteps = STEPS.filter(step => step.id !== 'select-provider' && (step.enabled?.(facts) ?? true));
  const currentIndex = visibleSteps.findIndex(step => step.id === current);

  return (
    <ProfileCardHeader>
      <Stepper>
        {visibleSteps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isReachable = isCompleted || index <= currentIndex;
          const labelText = step.label ? (typeof step.label === 'string' ? step.label : t(step.label)) : '';

          return (
            <Stepper.Item
              key={step.id}
              bullet={index + 1}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isReachable={isReachable}
              onClick={() => dispatch({ type: 'GOTO', step: step.id })}
            >
              {labelText}
            </Stepper.Item>
          );
        })}
      </Stepper>
    </ProfileCardHeader>
  );
};
