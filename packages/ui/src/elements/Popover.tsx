import { usePortalRoot } from '@clerk/shared/react';
import type { FloatingContext, ReferenceType } from '@floating-ui/react';
import { FloatingFocusManager, FloatingNode, FloatingPortal, useTransitionStyles } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { useAppearance } from '../customizables';
import { usePrefersReducedMotion } from '../hooks';

type PopoverProps = PropsWithChildren<{
  context: FloatingContext<ReferenceType>;
  nodeId?: string;
  isOpen?: boolean;
  initialFocus?: number | React.MutableRefObject<HTMLElement | null>;
  /**
   * When `true`, the popover appears instantly but stays mounted through a short fade-out on close,
   * instead of unmounting immediately. Opt-in so other consumers keep their current instant behavior.
   * @default false
   */
  animateExit?: boolean;
  /**
   * Determines whether outside elements are inert when modal is enabled. This enables pointer modality without a backdrop.
   * @default false
   */
  outsideElementsInert?: boolean;
  order?: Array<'reference' | 'floating' | 'content'>;
  /**
   * Whether focus is trapped inside the floating element and outside elements
   * are marked `aria-hidden`. Dialogs should be `true`; menus / dropdowns should
   * be `false` so the trigger remains in the accessibility tree.
   * @default true
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
    modal = true,
    nodeId,
    isOpen,
    animateExit = false,
    portal = true,
    root,
    children,
  } = props;

  const portalRoot = usePortalRoot();
  const effectiveRoot = root ?? portalRoot?.() ?? undefined;

  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedOptions;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

  // Appear instantly for snappiness, fade out on close. Keeping the element mounted
  // through the close transition (via `isMounted`) is what makes the exit animation possible.
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    // `close` matches the theme's `$slow` (200ms) transition duration.
    duration: { open: 0, close: animateExit && isMotionSafe ? 200 : 0 },
    initial: { opacity: 1 },
    open: { opacity: 1 },
    close: { opacity: animateExit ? 0 : 1 },
  });

  // Non-animating consumers keep the original synchronous `isOpen` unmount.
  const shouldRender = animateExit ? isMounted : isOpen;
  const content =
    animateExit && React.isValidElement<{ style?: React.CSSProperties }>(children)
      ? React.cloneElement(children, {
          style: { ...children.props.style, ...transitionStyles },
        })
      : children;

  if (portal) {
    return (
      <FloatingNode id={nodeId}>
        <FloatingPortal root={effectiveRoot}>
          {shouldRender && (
            <FloatingFocusManager
              context={context}
              initialFocus={initialFocus}
              outsideElementsInert={outsideElementsInert}
              order={order}
              modal={modal}
            >
              <>{content}</>
            </FloatingFocusManager>
          )}
        </FloatingPortal>
      </FloatingNode>
    );
  }

  return (
    <FloatingNode id={nodeId}>
      {shouldRender && (
        <FloatingFocusManager
          context={context}
          initialFocus={initialFocus}
          order={order}
          modal={modal}
        >
          <>{content}</>
        </FloatingFocusManager>
      )}
    </FloatingNode>
  );
};
