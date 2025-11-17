import type { FloatingContext, ReferenceType } from '@floating-ui/react';
import { FloatingFocusManager, FloatingNode, FloatingPortal } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

type PortalConfig = boolean | (() => HTMLElement | null);

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
  portal?: PortalConfig;
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

  // Resolve portal root
  const resolveRoot = (): HTMLElement | null => {
    if (typeof portal === 'function') {
      return portal();
    }
    if (typeof root === 'object' && 'current' in root) {
      return root.current;
    }
    return root || null;
  };

  const portalRoot = portal !== false ? resolveRoot() : null;
  const shouldPortal = portal !== false && portalRoot !== null;

  if (!isOpen) {
    return <FloatingNode id={nodeId} />;
  }

  const content = (
    <FloatingFocusManager
      context={context}
      initialFocus={initialFocus}
      outsideElementsInert={outsideElementsInert}
      order={order}
    >
      <>{children}</>
    </FloatingFocusManager>
  );

  if (shouldPortal) {
    return (
      <FloatingNode id={nodeId}>
        <FloatingPortal root={portalRoot}>{content}</FloatingPortal>
      </FloatingNode>
    );
  }

  return <FloatingNode id={nodeId}>{content}</FloatingNode>;
};
