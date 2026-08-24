'use client';

import { type FloatingContext, FloatingFocusManager } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { type InteractionType, interactionTypeFromEvent } from '../../utils/interaction-modality';
import { useDialogContext } from './dialog-context';

/**
 * Where focus goes when the dialog opens (`initialFocus`) or closes (`finalFocus`),
 * mirroring Base UI:
 *
 * - `true` or omitted — the default: first tabbable element on open, the trigger (with the
 *   pointer-close downgrade `useReturnFocus` applies) on close
 * - `false` — do not move focus
 * - a ref — focus that element
 * - a function of the interaction type behind the open/close (`''` when programmatic) —
 *   returns any of the above, with `void`/`null` meaning the default
 */
export type DialogFocusTarget =
  | boolean
  | React.RefObject<HTMLElement | null>
  | ((interactionType: InteractionType) => boolean | void | HTMLElement | null);

/**
 * Resolves `initialFocus` into the `number | ref` form `FloatingFocusManager` takes (a negative
 * index disables the focus move). The function form reads the open event floating-ui has
 * already recorded by the time the popup mounts; it must be pure, as re-renders re-invoke it.
 */
function useInitialFocus(
  initialFocus: DialogFocusTarget | undefined,
  open: boolean,
  floatingContext: FloatingContext,
): number | React.MutableRefObject<HTMLElement | null> {
  const elementRef = React.useRef<HTMLElement | null>(null);
  return React.useMemo(() => {
    if (!open || initialFocus === undefined || initialFocus === true) {
      return 0;
    }
    if (initialFocus === false) {
      return -1;
    }
    if (typeof initialFocus !== 'function') {
      return initialFocus as React.MutableRefObject<HTMLElement | null>;
    }
    const result = initialFocus(interactionTypeFromEvent(floatingContext.dataRef.current.openEvent));
    if (result === false) {
      return -1;
    }
    if (result instanceof HTMLElement) {
      elementRef.current = result;
      return elementRef;
    }
    return 0;
  }, [open, initialFocus, floatingContext]);
}

/**
 * Resolves `finalFocus` into the `boolean | ref` form `FloatingFocusManager`'s `returnFocus`
 * takes.
 *
 * The function form needs the event behind the close, so it runs inside floating-ui's
 * synchronous `openchange` emit — the root routes every close through
 * `floatingContext.onOpenChange`, and the emit precedes both the state commit and any focus
 * restoration. Only the function's decision is stored; the ref handed to the focus manager
 * materialises it lazily, at restore time, by which point `useReturnFocus` has applied its
 * pointer-close downgrade to the default.
 */
function useFinalFocus(
  finalFocus: DialogFocusTarget | undefined,
  returnFocusRef: React.MutableRefObject<HTMLElement | null>,
  floatingContext: FloatingContext,
): boolean | React.MutableRefObject<HTMLElement | null> {
  const finalFocusRef = React.useRef(finalFocus);
  React.useLayoutEffect(() => {
    finalFocusRef.current = finalFocus;
  });

  // The function's last decision: an element, `false` for "don't move focus", `true` for the
  // default (the trigger, via `returnFocusRef`).
  const decisionRef = React.useRef<HTMLElement | boolean>(true);
  const resolvedRef = React.useMemo(
    () => ({
      get current() {
        const decision = decisionRef.current;
        if (decision instanceof HTMLElement) {
          return decision;
        }
        return decision ? returnFocusRef.current : null;
      },
    }),
    [returnFocusRef],
  );

  React.useLayoutEffect(() => {
    function onOpenChange({ open, event }: { open: boolean; event?: Event }) {
      const target = finalFocusRef.current;
      if (open || typeof target !== 'function') {
        return;
      }
      const result = target(interactionTypeFromEvent(event));
      decisionRef.current = result instanceof HTMLElement ? result : result !== false;
    }
    floatingContext.events.on('openchange', onOpenChange);
    return () => floatingContext.events.off('openchange', onOpenChange);
  }, [floatingContext.events]);

  if (finalFocus === undefined || finalFocus === true) {
    return returnFocusRef;
  }
  if (finalFocus === false) {
    return false;
  }
  if (typeof finalFocus === 'function') {
    return resolvedRef;
  }
  return finalFocus as React.MutableRefObject<HTMLElement | null>;
}

/** Props for {@link DialogPopup}. */
export interface DialogPopupProps extends ComponentProps<'div'> {
  /** Where focus moves when the dialog opens. Default: the first tabbable element inside it. */
  initialFocus?: DialogFocusTarget;
  /** Where focus returns when the dialog closes. Default: the trigger, via `useReturnFocus`. */
  finalFocus?: DialogFocusTarget;
}

/** The dialog content container. Manages focus trapping via `FloatingFocusManager` and wires ARIA attributes from `Dialog.Title` and `Dialog.Description`. */
export const DialogPopup = React.forwardRef<HTMLDivElement, DialogPopupProps>(function DialogPopup(props, ref) {
  const { render, initialFocus, finalFocus, ...otherProps } = props;
  const {
    open,
    popupRef,
    refs,
    getFloatingProps,
    floatingContext,
    modal,
    isNested,
    isStacked,
    stackedChildCount,
    returnFocusRef,
    labelId,
    descriptionId,
    mounted,
    transitionProps,
  } = useDialogContext();

  const resolvedInitialFocus = useInitialFocus(initialFocus, open, floatingContext);
  const resolvedReturnFocus = useFinalFocus(finalFocus, returnFocusRef, floatingContext);

  const ownProps = {
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  } satisfies DefaultProps<'div'>;

  const defaultProps = {
    ...ownProps,
    ...(isNested ? { 'data-nested': '' } : {}),
    // Both can be set at once, and that is the ordinary case rather than an edge: in a
    // panel -> prompt -> alert stack the middle dialog is stacked on one surface while another
    // is stacked on it.
    ...(isStacked ? { 'data-stacked': '' } : {}),
    ...(stackedChildCount > 0 ? { 'data-stack-base': '' } : {}),
    ...getFloatingProps(),
    ...transitionProps,
  };

  const element = useRender({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    // floating-ui types `setFloating` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: [popupRef, refs.setFloating, ref],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  if (!element) {
    return null;
  }

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
      outsideElementsInert={modal}
      initialFocus={resolvedInitialFocus}
      returnFocus={resolvedReturnFocus}
    >
      {element}
    </FloatingFocusManager>
  );
});
