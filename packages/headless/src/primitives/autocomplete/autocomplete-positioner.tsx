'use client';

import { FloatingFocusManager, FloatingList } from '@floating-ui/react';
import React from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export interface AutocompletePositionerProps extends ComponentProps<'div'> {}

export function AutocompletePositioner(props: AutocompletePositionerProps) {
  const { render, ...otherProps } = props;
  const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, elementsRef, labelsRef } =
    useAutocompleteContext();

  const side = placement.split('-')[0];

  const defaultProps = {
    'data-cl-slot': 'autocomplete-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
  };

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
          props: mergeProps<'div'>(defaultProps, otherProps),
        })}
      </FloatingList>
    </FloatingFocusManager>
  );
}
