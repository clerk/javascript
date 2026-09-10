'use client';

import { FloatingFocusManager, FloatingList } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useAutocompleteContext } from './autocomplete-context';

export interface AutocompletePositionerProps extends ComponentProps<'div'> {
  /** Element used for popup positioning. Defaults to the input. */
  anchor?: HTMLElement | null;
}

export const AutocompletePositioner = React.forwardRef<HTMLDivElement, AutocompletePositionerProps>(
  function AutocompletePositioner(props, ref) {
    const { anchor, render, ...otherProps } = props;
    const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, elementsRef, labelsRef } =
      useAutocompleteContext();

    React.useLayoutEffect(() => {
      if (!anchor) {
        return;
      }
      refs.setPositionReference(anchor);
      return () => refs.setPositionReference(refs.domReference.current);
    }, [anchor, refs]);

    const side = placement.split('-')[0];

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
      // floating-ui types `setFloating` as a method signature, but at runtime it's
      // a stable callback that doesn't use `this`, so the unbound-method check is a
      // false positive here.
      // eslint-disable-next-line @typescript-eslint/unbound-method
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
