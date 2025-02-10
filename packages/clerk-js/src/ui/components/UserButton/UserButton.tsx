import { cloneElement, type ReactElement, useId } from 'react';

import { useUserButtonContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Popover, withCardStateProvider, withFloatingTree } from '../../elements';
import { usePopover } from '../../hooks';
import { UserButtonPopover } from './UserButtonPopover';
import { UserButtonTrigger } from './UserButtonTrigger';

const UserButtonWithFloatingTree = withFloatingTree<{ children: ReactElement }>(({ children }) => {
  const { defaultOpen } = useUserButtonContext();

  const { floating, reference, styles, toggle, isOpen, nodeId, context } = usePopover({
    defaultOpen,
    placement: 'bottom-end',
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

const _UserButton = () => {
  const { __experimental_asStandalone } = useUserButtonContext();

  return (
    <Flow.Root
      flow='userButton'
      sx={{ display: 'inline-flex' }}
    >
      {__experimental_asStandalone ? (
        <UserButtonPopover
          close={typeof __experimental_asStandalone === 'function' ? __experimental_asStandalone : undefined}
        />
      ) : (
        <UserButtonWithFloatingTree>
          <UserButtonPopover />
        </UserButtonWithFloatingTree>
      )}
    </Flow.Root>
  );
};

export const UserButton = withCoreUserGuard(withCardStateProvider(_UserButton));
