import { Flex, useLocalizations } from '@/customizables';

import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';
import { useWizard } from './elements/Wizard';

type ConfigureSSOHeaderProps = {
  /** Host-built leading content (e.g. a back control); right-aligns the stepper when present. */
  title?: React.ReactNode;
};

/**
 * The wizard breadcrumb, driven entirely by the generic entry-guard wizard
 * facade.
 *
 * Breadcrumb membership is the labelled steps in declaration order — the
 * provider-selection step carries no `label`, so it never appears (it replaced
 * the old `hidden` provider step). Each item's reachability comes straight from
 * the guard-driven `isReachable` flag (the same predicate `goToStep` checks), so
 * a disabled breadcrumb item and a blocked jump always agree. Completion stays
 * positional. The reset affordance now lives in the step footers
 * (`Step.Footer.Reset`), which delete the connection via the context mutation
 * rather than a wizard binding.
 *
 * `title` is host-owned content rendered as-is in the leading slot; when present
 * the stepper right-aligns, otherwise it stays left-aligned (standalone mount).
 */
export const ConfigureSSOHeader = ({ title }: ConfigureSSOHeaderProps): JSX.Element => {
  const { activeSteps, currentIndex, goToStep } = useWizard();
  const { t } = useLocalizations();

  // Breadcrumb membership = labelled steps. `select-provider` has no label, so
  // it is absent from the visual stepper while remaining a real navigable step.
  const visibleSteps = activeSteps.filter(step => step.label);
  const currentVisibleIndex = visibleSteps.findIndex(step => activeSteps[currentIndex]?.id === step.id);

  return (
    <ProfileCardHeader>
      {title}

      <Flex sx={title ? { marginInlineStart: 'auto' } : undefined}>
        <Stepper>
          {visibleSteps.map((step, index) => {
            const isCurrent = index === currentVisibleIndex;
            const labelText = step.label ? (typeof step.label === 'string' ? step.label : t(step.label)) : '';

            return (
              <Stepper.Item
                key={step.id}
                bullet={index + 1}
                isCurrent={isCurrent}
                isCompleted={step.isCompleted}
                // Guard-driven: bind directly to the wizard's reachability flag so
                // a disabled breadcrumb item and a blocked `goToStep` agree.
                isReachable={step.isReachable}
                onClick={() => goToStep(step.id)}
              >
                {labelText}
              </Stepper.Item>
            );
          })}
        </Stepper>
      </Flex>
    </ProfileCardHeader>
  );
};
