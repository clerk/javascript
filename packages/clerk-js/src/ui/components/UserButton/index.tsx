import { cloneElement, type ReactElement, useId } from 'react';

import { withCardStateProvider, withFloatingTree } from '@/ui/elements/contexts';
import { Popover } from '@/ui/elements/Popover';

import { useUserButtonContext, withCoreUserGuard } from '../../contexts';
import { usePortalContext } from '../../contexts/PortalContext';
import { Flow } from '../../customizables';
import { usePopover } from '../../hooks';
import { UserButtonPopover } from './UserButtonPopover';
import { UserButtonTrigger } from './UserButtonTrigger';

const UserButtonWithFloatingTree = withFloatingTree<{ children: ReactElement }>(({ children }) => {
  const { defaultOpen, portal: portalProp = true } = useUserButtonContext();

  // Get portal from context, fallback to prop, then default to true
  const portalFromContext = usePortalContext();
  const portal = portalProp !== undefined ? portalProp : (portalFromContext ?? true);

  // Detect if custom portal is used (function or from context indicates intentional custom portal)
  const useFixedPosition = typeof portal === 'function' || (portal !== false && portalFromContext !== undefined);

  const { floating, reference, styles, toggle, isOpen, nodeId, context } = usePopover({
    defaultOpen,
    placement: 'bottom-end',
    offset: 8,
    strategy: useFixedPosition ? 'fixed' : 'absolute',
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
        portal={portal}
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
