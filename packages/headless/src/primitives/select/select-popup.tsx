'use client';

import { useMergeRefs } from '@floating-ui/react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useSelectContext } from './select-context';

export type SelectPopupProps = ComponentProps<'div'>;

export function SelectPopup(props: SelectPopupProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { popupRef, transitionProps } = useSelectContext();

  const combinedRef = useMergeRefs([popupRef, consumerRef]);

  const defaultProps = {
    'data-cl-slot': 'select-popup',
    ref: combinedRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
