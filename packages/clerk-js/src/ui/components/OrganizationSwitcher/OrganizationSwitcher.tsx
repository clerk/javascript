import { useId } from 'react';

import { AcceptedInvitationsProvider, useOrganizationSwitcherContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Popover, withCardStateProvider, withFloatingTree } from '../../elements';
import { usePopover } from '../../hooks';
import { OrganizationSwitcherPopover } from './OrganizationSwitcherPopover';
import { OrganizationSwitcherTrigger } from './OrganizationSwitcherTrigger';

const _OrganizationSwitcher = withFloatingTree(() => {
  const { overlay, lockScroll } = useOrganizationSwitcherContext();
  const { floating, reference, styles, toggle, isOpen, nodeId, context } = usePopover({
    placement: 'bottom-start',
    offset: 8,
  });

  console.log({ overlay, lockScroll });

  const switcherButtonMenuId = useId();

  return (
    <Flow.Root
      flow='organizationSwitcher'
      sx={{ display: 'inline-flex' }}
    >
      <AcceptedInvitationsProvider>
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
          overlay={overlay}
          lockScroll={lockScroll}
        >
          <OrganizationSwitcherPopover
            id={switcherButtonMenuId}
            close={toggle}
            ref={floating}
            style={{ ...styles }}
          />
        </Popover>
      </AcceptedInvitationsProvider>
    </Flow.Root>
  );
});

export const OrganizationSwitcher = withCoreUserGuard(withCardStateProvider(_OrganizationSwitcher));
