'use client';

import { useMergeRefs } from '@floating-ui/react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompletePopupProps = ComponentProps<'div'>;

export function AutocompletePopup(props: AutocompletePopupProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { popupRef, transitionProps } = useAutocompleteContext();

  const combinedRef = useMergeRefs([popupRef, consumerRef]);

  const defaultProps = {
    'data-cl-slot': 'autocomplete-popup',
    ref: combinedRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
