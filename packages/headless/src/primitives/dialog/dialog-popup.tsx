'use client';

import { FloatingFocusManager } from '@floating-ui/react';
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
    returnFocusRef,
    finalFocusResolverRef,
    labelId,
    descriptionId,
    mounted,
    transitionProps,
  } = useDialogContext();

  // Resolved at render, into the `number | ref` form `FloatingFocusManager` takes (a negative
  // index disables the focus move). The function form reads the open event floating-ui has
  // already recorded by the time the popup mounts; it must be pure, as re-renders re-invoke it.
  const initialFocusElementRef = React.useRef<HTMLElement | null>(null);
  const resolvedInitialFocus = React.useMemo((): number | React.MutableRefObject<HTMLElement | null> => {
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
      initialFocusElementRef.current = result;
      return initialFocusElementRef;
    }
    return 0;
  }, [open, initialFocus, floatingContext]);

  // The function form of `finalFocus` resolves inside the root's close call — synchronously,
  // before any teardown — into this ref, which is what the focus manager then restores to.
  const resolvedFinalFocusRef = React.useRef<HTMLElement | null>(null);
  const finalFocusLatestRef = React.useRef(finalFocus);
  React.useLayoutEffect(() => {
    finalFocusLatestRef.current = finalFocus;
  });
  React.useLayoutEffect(() => {
    finalFocusResolverRef.current = event => {
      const target = finalFocusLatestRef.current;
      if (typeof target !== 'function') {
        return;
      }
      const result = target(interactionTypeFromEvent(event));
      resolvedFinalFocusRef.current =
        result instanceof HTMLElement ? result : result === false ? null : returnFocusRef.current;
    };
    return () => {
      finalFocusResolverRef.current = null;
    };
  }, [finalFocusResolverRef, returnFocusRef]);

  const resolvedReturnFocus =
    finalFocus === undefined || finalFocus === true
      ? returnFocusRef
      : finalFocus === false
        ? false
        : typeof finalFocus === 'function'
          ? resolvedFinalFocusRef
          : (finalFocus as React.MutableRefObject<HTMLElement | null>);

  const ownProps = {
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  } satisfies DefaultProps<'div'>;

  const defaultProps = {
    ...ownProps,
    ...(isNested ? { 'data-nested': '' } : {}),
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
