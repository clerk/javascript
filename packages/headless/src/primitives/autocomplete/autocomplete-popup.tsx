'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export interface AutocompletePopupProps extends ComponentProps<'div'> {}

export function AutocompletePopup(props: AutocompletePopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useAutocompleteContext();

  const defaultProps = {
    'data-cl-slot': 'autocomplete-popup',
    ref: popupRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
