'use client';

import React from 'react';

import { type ComponentProps, Freeze, mergeProps, useRender } from '../../utils';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompletePopupProps = ComponentProps<'div'>;

export const AutocompletePopup = React.forwardRef<HTMLDivElement, AutocompletePopupProps>(
  function AutocompletePopup(props, ref) {
    const { render, children, ...otherProps } = props;
    const { open, popupRef, transitionProps } = useAutocompleteContext();

    const defaultProps = {
      ...transitionProps,
      children: <Freeze frozen={!open}>{children}</Freeze>,
    };

    return useRender({
      defaultTagName: 'div',
      render,
      ref: [popupRef, ref],
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);
