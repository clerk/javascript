import { useSafeLayoutEffect } from '@clerk/shared/react';

import { descriptors, Flex, Icon, useLocalizations } from '@/customizables';
import { IconButton } from '@/elements/IconButton';
import { useUnsafeModalContext } from '@/elements/Modal';
import { useUnsafeProfileCardCloseButton } from '@/elements/ProfileCard';
import { Close } from '@/icons';
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
  const { setHeaderOwnsCloseButton } = useUnsafeProfileCardCloseButton();
  const isModal = Boolean(toggle);

  // In modal mode the header renders its own close button, so the card's shared
  // absolute overlay hides on desktop. Lifecycle registration only.
  useSafeLayoutEffect(() => {
    if (!isModal) {
      return;
    }
    setHeaderOwnsCloseButton?.(true);
    return () => setHeaderOwnsCloseButton?.(false);
  }, [isModal, setHeaderOwnsCloseButton]);

  // Breadcrumb membership = labelled steps. `select-provider` has no label, so
  // it is absent from the visual stepper while remaining a real navigable step.
  const visibleSteps = activeSteps.filter(step => step.label);
  const currentVisibleIndex = visibleSteps.findIndex(step => activeSteps[currentIndex]?.id === step.id);

  return (
    <ProfileCardHeader>
      {title}

      <Flex sx={title ? { marginInlineStart: 'auto', [mqu.md]: { marginInlineStart: 0 } } : undefined}>
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

      {isModal && (
        <IconButton
          elementDescriptor={descriptors.modalCloseButton}
          variant='ghost'
          aria-label='Close modal'
          onClick={toggle}
          icon={
            <Icon
              icon={Close}
              size='md'
            />
          }
          sx={t => ({
            color: t.colors.$colorMutedForeground,
            // Desktop-only: mobile falls back to the card's absolute close button.
            [mqu.md]: { display: 'none' },
          })}
        />
      )}
    </ProfileCardHeader>
  );
};
