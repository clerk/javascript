import { usePortalRoot } from '@clerk/shared/react';
import type { FloatingContext, ReferenceType } from '@floating-ui/react';
import { FloatingFocusManager, FloatingNode, FloatingPortal } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

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
  /**
   * Whether the floating element is modal. When `true`, focus is trapped inside and outside elements are inerted.
   * When `false`, focus can leave the floating element and it closes on focus out.
   * @default true (FloatingFocusManager default)
   */
  modal?: boolean;
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
    modal,
    nodeId,
    isOpen,
    portal = true,
    root,
    children,
  } = props;

  const portalRoot = usePortalRoot();
  const effectiveRoot = root ?? portalRoot?.() ?? undefined;

  if (portal) {
    return (
      <FloatingNode id={nodeId}>
        <FloatingPortal root={effectiveRoot}>
          {isOpen && (
            <FloatingFocusManager
              context={context}
              initialFocus={initialFocus}
              outsideElementsInert={outsideElementsInert}
              order={order}
              modal={modal}
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
          modal={modal}
        >
          <>{children}</>
        </FloatingFocusManager>
      )}
    </FloatingNode>
  );
};
