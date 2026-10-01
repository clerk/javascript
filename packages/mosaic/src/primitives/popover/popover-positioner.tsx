'use client';

import { FloatingFocusManager } from '@floating-ui/react';
import React from 'react';

import { type FocusTarget, useFinalFocus } from '../hooks/use-focus-target';
import { type ComponentProps, type DefaultProps, isKeyboardOpen, mergeProps, useRender } from '../utils';
import { usePopoverContext } from './popover-context';

export interface PopoverPositionerProps extends ComponentProps<'div'> {
  /**
   * Positions against this element instead of the trigger. With no `Popover.Trigger`, it stands in
   * for one: a press on it is not an outside press, and focus returns to it on close.
   */
  anchor?: HTMLElement | null;
  /** Where focus returns when the popup closes. Default: the trigger. */
  finalFocus?: FocusTarget;
}

export const PopoverPositioner = React.forwardRef<HTMLDivElement, PopoverPositionerProps>(
  function PopoverPositioner(props, ref) {
    const { anchor, finalFocus, render, ...otherProps } = props;
    const {
      mounted,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getFloatingProps,
      modal,
      initialFocus,
      returnFocusRef,
      labelId,
      descriptionId,
      hasTitle,
      hasDescription,
    } = usePopoverContext();

    React.useLayoutEffect(() => {
      if (!anchor) {
        return;
      }
      if (!refs.domReference.current) {
        refs.setReference(anchor);
        return () => refs.setReference(null);
      }
      refs.setPositionReference(anchor);
      return () => refs.setPositionReference(refs.domReference.current);
    }, [anchor, refs]);

    const resolvedReturnFocus = useFinalFocus(finalFocus, returnFocusRef, floatingContext);

    const side = placement.split('-')[0];

    const ownProps = {
      'data-side': side,
      style: floatingStyles,
      ...(hasTitle && { 'aria-labelledby': labelId }),
      ...(hasDescription && { 'aria-describedby': descriptionId }),
    } satisfies DefaultProps<'div'>;

    const defaultProps = { ...ownProps, ...getFloatingProps() };

    const element = useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      // floating-ui types `setFloating` as a method signature, but at runtime it's
      // a stable callback that doesn't use `this`, so the unbound-method check is a
      // false positive here.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: [refs.setFloating, ref],
      props: mergeProps<'div'>(defaultProps, otherProps),
    });

    if (!element) {
      return null;
    }

    return (
      <FloatingFocusManager
        context={floatingContext}
        modal={modal}
        initialFocus={initialFocus === 'first' || isKeyboardOpen(floatingContext) ? 0 : refs.floating}
        returnFocus={resolvedReturnFocus}
      >
        {element}
      </FloatingFocusManager>
    );
  },
);
