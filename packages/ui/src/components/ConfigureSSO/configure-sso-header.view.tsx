import { Flex, useLocalizations } from '@/customizables';
import { mqu } from '@/styledSystem';

import type { useConfigureSSOHeaderController } from './configure-sso-header.controller';
import { ProfileCardHeader } from './elements/ProfileCard';
import { Stepper } from './elements/Stepper';

export const ConfigureSSOHeaderView = ({
  title,
  controller,
}: {
  title?: React.ReactNode;
  controller: ReturnType<typeof useConfigureSSOHeaderController>;
}): JSX.Element => {
  const { visibleSteps, currentVisibleIndex, goToStep, isModal } = controller;
  const { t } = useLocalizations();
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
