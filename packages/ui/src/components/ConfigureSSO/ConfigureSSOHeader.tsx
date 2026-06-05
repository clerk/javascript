import { __internal_useOrganizationBase } from '@clerk/shared/react';
import { useState } from 'react';

import { Button, descriptors, localizationKeys, useLocalizations } from '@/customizables';

import { useConfigureSSO } from './ConfigureSSOContext';
import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';
import { useWizard } from './elements/Wizard';
import { ResetConnectionDialog } from './ResetConnectionDialog';

/**
 * The wizard breadcrumb, driven entirely by the generic entry-guard wizard
 * facade.
 *
 * Breadcrumb membership is the labelled steps in declaration order — the
 * provider-selection step carries no `label`, so it never appears (it replaced
 * the old `hidden` provider step). Each item's reachability comes straight from
 * the guard-driven `isReachable` flag (the same predicate `goToStep` checks), so
 * a disabled breadcrumb item and a blocked jump always agree. Completion stays
 * positional. The top-level reset control lives here so its `useWizard()`
 * resolves to the TOP-LEVEL wizard.
 */
export const ConfigureSSOHeader = (): JSX.Element => {
  const { activeSteps, currentIndex, goToStep } = useWizard();
  const { t } = useLocalizations();

  // Breadcrumb membership = labelled steps. `select-provider` has no label, so
  // it is absent from the visual stepper while remaining a real navigable step.
  const visibleSteps = activeSteps.filter(step => step.label);
  const currentVisibleIndex = visibleSteps.findIndex(step => activeSteps[currentIndex]?.id === step.id);

  return (
    <ProfileCardHeader>
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

      <ConfigureSSOReset />
    </ProfileCardHeader>
  );
};

/**
 * The single top-level reset affordance. Rendered once under the top-level
 * `<Wizard>` (via the header) so its `goToStep` resolves against the TOP-LEVEL
 * wizard, never a nested sub-flow — this is what kills the old per-step
 * nested-binding trap. Shown only while a connection exists. The dialog deletes
 * the connection and jumps back to the entry step.
 *
 * NOTE (for review): placement here in the header row is a first cut — Iago owns
 * the exact slot/affordance. The behaviour (top-level-owned reset, gated on
 * `hasConnection`) is the load-bearing part.
 */
const ConfigureSSOReset = (): JSX.Element | null => {
  const { organizationEnterpriseConnection: c } = useConfigureSSO();
  const organization = __internal_useOrganizationBase();
  const [isOpen, setIsOpen] = useState(false);

  if (!c.hasConnection) {
    return null;
  }

  return (
    <>
      <Button
        elementDescriptor={descriptors.configureSSOFooterResetButton}
        variant='ghost'
        size='sm'
        colorScheme='danger'
        onClick={() => setIsOpen(true)}
        localizationKey={localizationKeys('configureSSO.confirmation.resetSection.title')}
        sx={{ marginInlineStart: 'auto' }}
      />
      <ResetConnectionDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        confirmationValue={organization?.name ?? ''}
      />
    </>
  );
};
