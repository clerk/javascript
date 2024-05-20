import { useId } from 'react';

import { useUserButtonContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Popover, withCardStateProvider, withFloatingTree } from '../../elements';
import { usePopover } from '../../hooks';
import { UserButtonPopover } from './UserButtonPopover';
import { UserButtonTrigger } from './UserButtonTrigger';

const _UserButton = withFloatingTree(() => {
  const { defaultOpen, __experimental_open, __experimental_onOpenChanged } = useUserButtonContext();
  const { floating, reference, styles, toggle, isOpen, nodeId, context } = usePopover({
    defaultOpen,
    open: __experimental_open,
    onOpenChanged: __experimental_onOpenChanged,
    placement: 'bottom-end',
    offset: 8,
  });

  const userButtonMenuId = useId();

  return (
    <Flow.Root
      flow='userButton'
      sx={{ display: 'inline-flex' }}
    >
      <UserButtonTrigger
        ref={reference}
        onClick={toggle}
        isOpen={isOpen}
        aria-controls={isOpen ? userButtonMenuId : undefined}
        aria-expanded={isOpen}
      />
      <Popover
        nodeId={nodeId}
        context={context}
        isOpen={isOpen}
      >
        <UserButtonPopover
          id={userButtonMenuId}
          close={toggle}
          ref={floating}
          style={{ ...styles }}
        />
      </Popover>
    </Flow.Root>
  );
});

export const UserButton = withCoreUserGuard(withCardStateProvider(_UserButton));
