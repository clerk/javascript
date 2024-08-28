import { cloneElement, type ReactElement, useId } from 'react';

import { useUserButtonContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Popover, withCardStateProvider, withFloatingTree } from '../../elements';
import { usePopover } from '../../hooks';
import { UserButtonPopover } from './UserButtonPopover';
import { UserButtonTrigger } from './UserButtonTrigger';

const UserButtonWithFloatingTree = withFloatingTree<{ children: ReactElement }>(({ children }) => {
  const { __experimental_onOpenChanged, __experimental_open, defaultOpen } = useUserButtonContext();

  const { floating, reference, styles, toggle, isOpen, nodeId, context } = usePopover({
    defaultOpen,
    open: __experimental_open,
    onOpenChanged: __experimental_onOpenChanged,
    placement: 'bottom-start',
    offset: 8,
  });

  const userButtonMenuId = useId();

  return (
    <>
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
        {cloneElement(children, {
          id: userButtonMenuId,
          close: toggle,
          ref: floating,
          style: styles,
        })}
      </Popover>
    </>
  );
});

const _UserButton = withFloatingTree(() => {
  const { __experimental_hideTrigger, __experimental_onActionEnded } = useUserButtonContext();

  return (
    <Flow.Root
      flow='userButton'
      sx={{ display: 'inline-flex' }}
    >
      {__experimental_hideTrigger ? (
        <UserButtonPopover close={__experimental_onActionEnded} />
      ) : (
        <UserButtonWithFloatingTree>
          <UserButtonPopover />
        </UserButtonWithFloatingTree>
      )}
    </Flow.Root>
  );
});

export const UserButton = withCoreUserGuard(withCardStateProvider(_UserButton));
