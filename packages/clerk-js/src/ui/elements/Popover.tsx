import type { FloatingContext, ReferenceType } from '@floating-ui/react';
import { FloatingFocusManager, FloatingNode, FloatingPortal } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { usePortalContext } from '../contexts';

type PopoverProps = PropsWithChildren<{
  context: FloatingContext<ReferenceType>;
  nodeId?: string;
  isOpen?: boolean;
  initialFocus?: number | React.MutableRefObject<HTMLElement | null>;
  /**
   * Determines whether outside elements are inert when modal is enabled. This enables pointer modality without a backdrop.
   * @default false
   */
  outsideElementsInert?: boolean;
  order?: Array<'reference' | 'floating' | 'content'>;
  portal?: boolean;
  /**
   * The root element to render the portal into.
   * @default document.body
   */
  root?: HTMLElement | React.MutableRefObject<HTMLElement | null>;
}>;

export const Popover = (props: PopoverProps) => {
  const {
    context,
    initialFocus,
    outsideElementsInert = false,
    order = ['reference', 'content'],
    nodeId,
    isOpen,
    portal = true,
    root,
    children,
  } = props;

  const { getContainer } = usePortalContext();

  // Resolve the root element to portal to
  // Priority: root prop > portal prop > PortalProvider context > default behavior
  let resolvedRoot: HTMLElement | React.MutableRefObject<HTMLElement | null> | null = null;
  let shouldPortal = false;

  if (root !== undefined) {
    // root prop takes highest priority - always portal to the provided root
    resolvedRoot = root;
    shouldPortal = true;
  } else if (portal === false) {
    // portal prop explicitly set to false - portal prop takes precedence over context
    // Even if context provides a container, we respect portal={false}
    shouldPortal = false;
  } else {
    // portal prop is true (default) or undefined - check context
    const contextContainer = getContainer();
    if (contextContainer === null) {
      // Context explicitly disables portaling (similar to portal={false})
      shouldPortal = false;
    } else {
      // Use context container (can be HTMLElement or ref)
      resolvedRoot = contextContainer;
      shouldPortal = true;
    }
  }

  if (shouldPortal) {
    return (
      <FloatingNode id={nodeId}>
        <FloatingPortal root={resolvedRoot || undefined}>
          {isOpen && (
            <FloatingFocusManager
              context={context}
              initialFocus={initialFocus}
              outsideElementsInert={outsideElementsInert}
              order={order}
            >
              <>{children}</>
            </FloatingFocusManager>
          )}
        </FloatingPortal>
      </FloatingNode>
    );
  }

  return (
    <FloatingNode id={nodeId}>
      {isOpen && (
        <FloatingFocusManager
          context={context}
          initialFocus={initialFocus}
          order={order}
        >
          <>{children}</>
        </FloatingFocusManager>
      )}
    </FloatingNode>
  );
};
