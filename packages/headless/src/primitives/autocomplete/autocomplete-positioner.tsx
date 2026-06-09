'use client';

import { FloatingFocusManager, FloatingList, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompletePositionerProps = ComponentProps<'div'>;

export function AutocompletePositioner(props: AutocompletePositionerProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, elementsRef, labelsRef } =
    useAutocompleteContext();

  const side = placement.split('-')[0];

  // floating-ui types `setFloating` as a method signature, but at runtime it's
  // a stable callback that doesn't use `this`, so the unbound-method check is a
  // false positive here.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const combinedRef = useMergeRefs([refs.setFloating, consumerRef]);

  const floatingProps = getFloatingProps() as React.ComponentPropsWithRef<'div'>;
  const wiredId = floatingProps.id;

  const defaultProps = {
    'data-cl-slot': 'autocomplete-positioner',
    'data-cl-side': side,
    ref: combinedRef,
    style: floatingStyles,
    ...floatingProps,
  };

  const merged = mergeProps<'div'>(defaultProps, otherProps);
  // The wired id is owned by the primitive: a consumer-supplied id must not
  // override it, or the aria-controls pairing would silently break.
  if (wiredId != null) {
    merged.id = wiredId;
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
        {renderElement({
          defaultTagName: 'div',
          render,
          enabled: mounted,
          props: merged,
        })}
      </FloatingList>
    </FloatingFocusManager>
  );
}
