'use client';

import { FloatingList } from '@floating-ui/react';
import React, { useEffect } from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export interface AutocompleteListProps extends ComponentProps<'div'> {}

export function AutocompleteList(props: AutocompleteListProps) {
  const { render, ...otherProps } = props;
  const { elementsRef, labelsRef, refs, getFloatingProps, setInlineMode } = useAutocompleteContext();

  useEffect(() => {
    setInlineMode(true);
    return () => setInlineMode(false);
  }, [setInlineMode]);

  const defaultProps = {
    'data-cl-slot': 'autocomplete-list',
    ref: refs.setFloating,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
  };

  return (
    <FloatingList
      elementsRef={elementsRef}
      labelsRef={labelsRef}
    >
      {
        renderElement({
          defaultTagName: 'div',
          render,
          props: mergeProps<'div'>(defaultProps, otherProps),
        })!
      }
    </FloatingList>
  );
}
