import { cloneElement, type ReactElement, useCallback, useId, useRef } from 'react';

import { withCardStateProvider, withFloatingTree } from '@/ui/elements/contexts';
import { Popover } from '@/ui/elements/Popover';

import { useUserButtonContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { usePopover } from '../../hooks';
import { UserButtonPopover } from './UserButtonPopover';
import { UserButtonTrigger } from './UserButtonTrigger';

const UserButtonWithFloatingTree = withFloatingTree<{ children: ReactElement }>(({ children }) => {
  const { defaultOpen } = useUserButtonContext();

  const { floating, reference, styles, toggle, isOpen, nodeId, context, getReferenceProps, getFloatingProps } =
    usePopover({
      defaultOpen,
      placement: 'bottom-end',
      offset: 8,
    });

  const userButtonMenuId = useId();
  const popoverRef = useRef<HTMLElement>(null);
  const floatingRef = useCallback(
    (node: HTMLElement | null) => {
      floating(node);
      popoverRef.current = node;
    },
    [floating],
  );

  return (
    <>
      <UserButtonTrigger
        ref={reference}
        isOpen={isOpen}
        {...getReferenceProps({
          'aria-controls': isOpen ? userButtonMenuId : undefined,
        })}
      />
      <Popover
        nodeId={nodeId}
        context={context}
        isOpen={isOpen}
        order={['content']}
        initialFocus={popoverRef}
      >
        {cloneElement(
          children,
          getFloatingProps({
            id: userButtonMenuId,
            close: toggle,
            tabIndex: -1,
            ref: floatingRef,
            style: styles,
          }),
        )}
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
