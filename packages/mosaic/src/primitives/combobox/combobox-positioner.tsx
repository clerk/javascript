'use client';

import { FloatingFocusManager, FloatingList } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { parsePlacement } from '../utils/side-offset';
import { useComboboxContext } from './combobox-context';

export interface ComboboxPositionerProps extends ComponentProps<'div'> {
  /** Element used for popup positioning. Defaults to the input. */
  anchor?: HTMLElement | null;
}

export const ComboboxPositioner = React.forwardRef<HTMLDivElement, ComboboxPositionerProps>(
  function ComboboxPositioner(props, ref) {
    const { anchor, render, ...otherProps } = props;
    const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, elementsRef, labelsRef } =
      useComboboxContext();

    React.useLayoutEffect(() => {
      if (!anchor) {
        return;
      }
      refs.setPositionReference(anchor);
      return () => refs.setPositionReference(refs.domReference.current);
    }, [anchor, refs]);

    const side = parsePlacement(placement).side;

    const floatingProps = getFloatingProps();
    const wiredId = floatingProps.id;

    const ownProps = {
      'data-side': side,
      style: floatingStyles,
    } satisfies DefaultProps<'div'>;

    const defaultProps = { ...ownProps, ...floatingProps };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The wired id is owned by the primitive: a consumer-supplied id must not
    // override it, or the aria-controls pairing would silently break.
    if (wiredId != null) {
      merged.id = wiredId;
    }

    const element = useRender({
      defaultTagName: 'div',
      render,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- floating-ui types `setFloating` as a method, but it is a stable callback that does not use `this`.
      ref: [refs.setFloating, ref],
      enabled: mounted,
      props: merged,
    });

    if (!element) {
      return null;
    }

    return (
      <FloatingFocusManager
        context={floatingContext}
        initialFocus={-1}
        visuallyHiddenDismiss
        modal={false}
      >
        <FloatingList
          elementsRef={elementsRef}
          labelsRef={labelsRef}
        >
          {element}
        </FloatingList>
      </FloatingFocusManager>
    );
  },
);
