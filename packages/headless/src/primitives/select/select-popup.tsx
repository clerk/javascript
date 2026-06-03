'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useSelectContext } from './select-context';

export interface SelectPopupProps extends ComponentProps<'div'> {}

export function SelectPopup(props: SelectPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useSelectContext();

  const defaultProps = {
    'data-cl-slot': 'select-popup',
    ref: popupRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
