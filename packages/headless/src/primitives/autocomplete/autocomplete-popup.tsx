'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompletePopupProps = ComponentProps<'div'>;

export const AutocompletePopup = React.forwardRef<HTMLDivElement, AutocompletePopupProps>(
  function AutocompletePopup(props, ref) {
    const { render, ...otherProps } = props;
    const { popupRef, transitionProps } = useAutocompleteContext();

    const combinedRef = useMergeRefs([popupRef, ref]);

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
  },
);
