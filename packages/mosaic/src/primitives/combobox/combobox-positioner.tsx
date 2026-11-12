'use client';

import { FloatingFocusManager, FloatingList } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { parsePlacement } from '../utils/side-offset';
import { useComboboxContext } from './combobox-context';

export interface ComboboxPositionerProps extends ComponentProps<'div'> {
  /** Element used for popup positioning. Defaults to `Chips` when rendered, otherwise the input. */
  anchor?: HTMLElement | null;
}

export const ComboboxPositioner = React.forwardRef<HTMLDivElement, ComboboxPositionerProps>(
  function ComboboxPositioner(props, ref) {
    const { anchor, render, ...otherProps } = props;
    const {
      mounted,
      multiple,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getFloatingProps,
      elementsRef,
      labelsRef,
      chipsElement,
    } = useComboboxContext();
    const resolvedAnchor = anchor ?? chipsElement;

    const restoreReference = React.useCallback(() => refs.setPositionReference(refs.domReference.current), [refs]);

    React.useLayoutEffect(() => {
      if (!resolvedAnchor) {
        return;
      }
      refs.setPositionReference(resolvedAnchor);
      return restoreReference;
    }, [resolvedAnchor, refs, restoreReference]);

    const side = parsePlacement(placement).side;

    const floatingProps = getFloatingProps();
    const wiredId = floatingProps['id'];

    const ownProps = {
      'data-side': side,
      'aria-multiselectable': multiple || undefined,
      style: floatingStyles,
    } satisfies DefaultProps<'div'>;

    const defaultProps = { ...ownProps, ...floatingProps };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The wired id is owned by the primitive: a consumer-supplied id must not
    // override it, or the aria-controls pairing would silently break.
    if (typeof wiredId === 'string') {
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
        returnFocus={false}
        visuallyHiddenDismiss
        modal={false}
        getInsideElements={() => (chipsElement ? [chipsElement] : [])}
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
