import { useId } from 'react';

import { withOrganizationsEnabledGuard } from '../../common';
import { AcceptedInvitationsProvider, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Popover, withCardStateProvider, withFloatingTree } from '../../elements';
import { usePopover } from '../../hooks';
import { OrganizationSwitcherPopover } from './OrganizationSwitcherPopover';
import { OrganizationSwitcherTrigger } from './OrganizationSwitcherTrigger';

const _OrganizationSwitcher = withFloatingTree(() => {
  const { floating, reference, styles, toggle, isOpen, nodeId, context } = usePopover({
    placement: 'bottom-start',
    offset: 8,
  });

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
        />
        <Popover
          nodeId={nodeId}
          context={context}
          isOpen={isOpen}
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

export const OrganizationSwitcher = withOrganizationsEnabledGuard(
  withCoreUserGuard(withCardStateProvider(_OrganizationSwitcher)),
  'OrganizationSwitcher',
  { mode: 'hide' },
);
