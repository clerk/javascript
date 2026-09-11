'use client';

import React from 'react';

import { type ComponentProps, Freeze, mergeProps, useRender } from '../../utils';
import { useSelectContext } from './select-context';

export type SelectPopupProps = ComponentProps<'div'>;

export const SelectPopup = React.forwardRef<HTMLDivElement, SelectPopupProps>(function SelectPopup(props, ref) {
  const { render, children, ...otherProps } = props;
  const { open, popupRef, transitionProps } = useSelectContext();

  const defaultProps = {
    ...transitionProps,
    // Picking an option changes the value and closes in the same tick, so without this the
    // selection would jump to the new row under the exit animation.
    children: <Freeze frozen={!open}>{children}</Freeze>,
  };

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [popupRef, ref],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
