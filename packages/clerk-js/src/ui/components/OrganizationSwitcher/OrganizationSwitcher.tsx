import type { ReactElement } from 'react';
import { cloneElement, useId } from 'react';

import { AcceptedInvitationsProvider, useOrganizationSwitcherContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Popover, withCardStateProvider, withFloatingTree } from '../../elements';
import { usePopover } from '../../hooks';
import { OrganizationSwitcherPopover } from './OrganizationSwitcherPopover';
import { OrganizationSwitcherTrigger } from './OrganizationSwitcherTrigger';

const OrganizationSwitcherWithFloatingTree = withFloatingTree<{ children: ReactElement }>(({ children }) => {
  const { defaultOpen } = useOrganizationSwitcherContext();

  const { floating, reference, styles, toggle, isOpen, nodeId, context } = usePopover({
    defaultOpen,
    placement: 'bottom-start',
    offset: 8,
  });

  const switcherButtonMenuId = useId();

  return (
    <>
      <OrganizationSwitcherTrigger
        ref={reference}
        onClick={toggle}
        isOpen={isOpen}
        aria-controls={isOpen ? switcherButtonMenuId : undefined}
        aria-expanded={isOpen}
      />
      <Popover
        nodeId={nodeId}
        context={context}
        isOpen={isOpen}
      >
        {cloneElement(children, {
          id: switcherButtonMenuId,
          close: toggle,
          ref: floating,
          style: styles,
        })}
      </Popover>
    </>
  );
});

const _OrganizationSwitcher = () => {
  const { __experimental_asStandalone } = useOrganizationSwitcherContext();

  return (
    <Flow.Root
      flow='organizationSwitcher'
      sx={{ display: 'inline-flex' }}
    >
      <AcceptedInvitationsProvider>
        {__experimental_asStandalone ? (
          <OrganizationSwitcherPopover
            close={typeof __experimental_asStandalone === 'function' ? __experimental_asStandalone : undefined}
          />
        ) : (
          <OrganizationSwitcherWithFloatingTree>
            <OrganizationSwitcherPopover />
          </OrganizationSwitcherWithFloatingTree>
        )}
      </AcceptedInvitationsProvider>
    </Flow.Root>
  );
};

export const OrganizationSwitcher = withCoreUserGuard(withCardStateProvider(_OrganizationSwitcher));
