'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useSelectContext } from './select-context';

export type SelectPopupProps = ComponentProps<'div'>;

export const SelectPopup = React.forwardRef<HTMLDivElement, SelectPopupProps>(function SelectPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useSelectContext();

  const combinedRef = useMergeRefs([popupRef, ref]);

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
});
