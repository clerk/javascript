import { usePortalRoot } from '@clerk/shared/react';
import type { FloatingContext, ReferenceType } from '@floating-ui/react';
import { FloatingFocusManager, FloatingNode, FloatingPortal, useTransitionStyles } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { useAppearance } from '../customizables';
import { transitionDurationValues, transitionTiming } from '../foundations/transitions';
import { usePrefersReducedMotion } from '../hooks';

type PopoverProps = PropsWithChildren<{
  context: FloatingContext<ReferenceType>;
  nodeId?: string;
  isOpen?: boolean;
  initialFocus?: number | React.MutableRefObject<HTMLElement | null>;
  /**
   * When `true`, the popover animates in on mount with an origin-aware scale + fade and stays
   * mounted through a matching fade-out on close, instead of appearing/unmounting instantly.
   * Opt-in so other consumers keep their current instant behavior.
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
  const animate = animateExit && isMotionSafe;

  // Animate in on mount and out on close with an origin-aware scale + fade. Keeping the element
  // mounted through the close transition (via `isMounted`) is what makes the exit animation
  // possible. `transformOrigin` is derived from the resolved placement so the popover grows from
  // the edge nearest its trigger (Floating UI's placement-aware transitions).
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: {
      open: animate ? transitionDurationValues.fast : 0,
      close: animate ? transitionDurationValues.slower : 0,
    },
    common: ({ side }) => ({
      transformOrigin: {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      }[side],
      transitionTimingFunction: transitionTiming.swiftOut,
    }),
    initial: { opacity: animate ? 0 : 1, transform: animate ? 'scale(0.96)' : 'scale(1)' },
    open: { opacity: 1, transform: 'scale(1)' },
    close: { opacity: animate ? 0 : 1, transform: animate ? 'scale(0.96)' : 'scale(1)' },
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
