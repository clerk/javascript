'use client';

import { FloatingFocusManager, FloatingList } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompletePositionerProps = ComponentProps<'div'>;

export const AutocompletePositioner = React.forwardRef<HTMLDivElement, AutocompletePositionerProps>(
  function AutocompletePositioner(props, ref) {
    const { render, ...otherProps } = props;
    const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, elementsRef, labelsRef } =
      useAutocompleteContext();

    const side = placement.split('-')[0];

    const floatingProps = getFloatingProps();
    const wiredId = floatingProps.id;

    const ownProps = {
      'data-cl-slot': 'autocomplete-positioner',
      'data-cl-side': side,
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
