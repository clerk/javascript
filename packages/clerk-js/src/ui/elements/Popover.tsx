import type { FloatingContext, ReferenceType } from '@floating-ui/react';
import { FloatingFocusManager, FloatingNode, FloatingPortal } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

type PopoverProps = PropsWithChildren<{
  context: FloatingContext<ReferenceType>;
  nodeId?: string;
  isOpen?: boolean;
  initialFocus?: number | React.MutableRefObject<HTMLElement | null>;
  order?: Array<'reference' | 'floating' | 'content'>;
  portal?: boolean;
}>;

export const Popover = (props: PopoverProps) => {
  const { context, initialFocus, order = ['reference', 'content'], nodeId, isOpen, portal = true, children } = props;

  if (portal) {
    return (
      <FloatingNode id={nodeId}>
        <FloatingPortal>
          {isOpen && (
            <FloatingFocusManager
              context={context}
              initialFocus={initialFocus}
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
