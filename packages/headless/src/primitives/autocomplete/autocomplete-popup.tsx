'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompletePopupProps = ComponentProps<'div'>;

export const AutocompletePopup = React.forwardRef<HTMLDivElement, AutocompletePopupProps>(
  function AutocompletePopup(props, ref) {
    const { render, ...otherProps } = props;
    const { popupRef, transitionProps } = useAutocompleteContext();

    const defaultProps = {
      'data-cl-slot': 'autocomplete-popup',
      ...transitionProps,
    };

    return useRender({
      defaultTagName: 'div',
      render,
      ref: [popupRef, ref],
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);
