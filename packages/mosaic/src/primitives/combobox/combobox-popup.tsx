'use client';

import React from 'react';

import { type ComponentProps, Freeze, mergeProps, useRender } from '../../utils';
import { useComboboxContext } from './combobox-context';

export type ComboboxPopupProps = ComponentProps<'div'>;

export const ComboboxPopup = React.forwardRef<HTMLDivElement, ComboboxPopupProps>(function ComboboxPopup(props, ref) {
  const { render, children, ...otherProps } = props;
  const { open, popupRef, transitionProps } = useComboboxContext();

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
});
