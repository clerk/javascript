import type { ReactElement } from 'react';
import { cloneElement, useCallback, useId, useRef } from 'react';

import { withCardStateProvider, withFloatingTree } from '@/ui/elements/contexts';
import { Popover } from '@/ui/elements/Popover';

import { AcceptedInvitationsProvider, useOrganizationSwitcherContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { usePopover } from '../../hooks';
import { OrganizationSwitcherPopover } from './OrganizationSwitcherPopover';
import { OrganizationSwitcherTrigger } from './OrganizationSwitcherTrigger';

const OrganizationSwitcherWithFloatingTree = withFloatingTree<{ children: ReactElement }>(({ children }) => {
  const { defaultOpen } = useOrganizationSwitcherContext();

  const { floating, reference, styles, toggle, isOpen, nodeId, context, getReferenceProps, getFloatingProps } =
    usePopover({
      defaultOpen,
      placement: 'bottom-start',
      offset: 8,
    });

  const switcherButtonMenuId = useId();
  const popoverRef = useRef<HTMLElement | null>(null);
  const floatingRef = useCallback(
    (node: HTMLElement | null) => {
      floating(node);
      popoverRef.current = node;
    },
    [floating],
  );

  return (
    <>
      <OrganizationSwitcherTrigger
        ref={reference}
        isOpen={isOpen}
        {...getReferenceProps({
          'aria-controls': isOpen ? switcherButtonMenuId : undefined,
        })}
      />
      <Popover
        nodeId={nodeId}
        context={context}
        isOpen={isOpen}
        order={['content']}
        initialFocus={popoverRef}
      >
        {cloneElement(children, {
          ...getFloatingProps({
            id: switcherButtonMenuId,
            tabIndex: -1,
            ref: floatingRef,
            style: styles,
          }),
          close: toggle,
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
