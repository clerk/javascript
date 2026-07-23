'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useSelectContext } from './select-context';

export type SelectPopupProps = ComponentProps<'div'>;

export const SelectPopup = React.forwardRef<HTMLDivElement, SelectPopupProps>(function SelectPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useSelectContext();

  const defaultProps = {
    'data-cl-slot': 'select-popup',
    ...transitionProps,
  };

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [popupRef, ref],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
