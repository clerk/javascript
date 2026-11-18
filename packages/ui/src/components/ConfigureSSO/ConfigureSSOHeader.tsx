import { Flex, useLocalizations } from '@/customizables';
import { useUnsafeModalContext } from '@/elements/Modal';
import { mqu } from '@/styledSystem';

import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';
import { useWizard } from './elements/Wizard';

type ConfigureSSOHeaderProps = {
  title?: React.ReactNode;
};

export const ConfigureSSOHeader = ({ title }: ConfigureSSOHeaderProps): JSX.Element => {
  const { activeSteps, currentIndex, goToStep } = useWizard();
  const { t } = useLocalizations();
  const { toggle } = useUnsafeModalContext();
  const isModal = Boolean(toggle);

  // Breadcrumb membership = labelled steps. `select-provider` has no label, so
  // it is absent from the visual stepper while remaining a real navigable step.
  const visibleSteps = activeSteps.filter(step => step.label);
  const currentVisibleIndex = visibleSteps.findIndex(step => activeSteps[currentIndex]?.id === step.id);

  return (
    <ProfileCardHeader>
      {title}

      <Flex
        sx={t => ({
          ...(title ? { marginInlineStart: 'auto', [mqu.md]: { marginInlineStart: 0 } } : {}),
          // Reserve room for the card's absolute close button (modal only) so the
          // stepper doesn't render under it. Steps wrap when space is tight.
          ...(isModal ? { marginInlineEnd: t.space.$10 } : {}),
        })}
      >
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
