import type { FloatingContext, ReferenceType } from '@floating-ui/react';
import {
  FloatingFocusManager,
  FloatingNode,
  FloatingOverlay as _FloatingOverlay,
  FloatingPortal,
} from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { descriptors } from '../customizables';
import { makeCustomizable } from '../customizables/makeCustomizable';

const FloatingOverlay = makeCustomizable(_FloatingOverlay, {});

type PopoverProps = PropsWithChildren<{
  context: FloatingContext<ReferenceType>;
  nodeId: string;
  isOpen?: boolean;
  initialFocus?: number | React.MutableRefObject<HTMLElement | null>;
  order?: Array<'reference' | 'floating' | 'content'>;
  portal?: boolean;
  /**
   * Renders an element to block pointer events behind a floating element.
   * @default false
   */
  overlay?: boolean;
  /**
   * Whether the <body> is prevented from scrolling while the overlay is rendered.
   * @default false
   */
  lockScroll?: boolean;
}>;

export const Popover = (props: PopoverProps) => {
  const {
    context,
    initialFocus,
    order = ['reference', 'content'],
    nodeId,
    isOpen,
    portal = true,
    children,
    overlay = false,
    lockScroll = false,
  } = props;

  if (portal) {
    return (
      <FloatingNode id={nodeId}>
        <FloatingPortal>
          {isOpen && (
            <>
              {overlay ? (
                <FloatingOverlay
                  elementDescriptor={descriptors.popoverOverlay}
                  lockScroll={lockScroll}
                />
              ) : null}
              <FloatingFocusManager
                context={context}
                initialFocus={initialFocus}
                order={order}
              >
                <>{children}</>
              </FloatingFocusManager>
            </>
          )}
        </FloatingPortal>
      </FloatingNode>
    );
  }

  return (
    <FloatingNode id={nodeId}>
      {isOpen && (
        <>
          {overlay ? <FloatingOverlay lockScroll={lockScroll} /> : null}
          <FloatingFocusManager
            context={context}
            initialFocus={initialFocus}
            order={order}
          >
            <>{children}</>
          </FloatingFocusManager>
        </>
      )}
    </FloatingNode>
  );
};
