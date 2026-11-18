'use client';

import React from 'react';

import { type ComponentProps, useRender } from '../utils';
import { useComboboxContext } from './combobox-context';

export type ComboboxInputGroupProps = ComponentProps<'div'>;

export const ComboboxInputGroup = React.forwardRef<HTMLDivElement, ComboboxInputGroupProps>(
  function ComboboxInputGroup(props, ref) {
    const { render, ...otherProps } = props;
    const { setInputGroup } = useComboboxContext();

    return useRender({
      defaultTagName: 'div',
      render,
      ref: [ref, setInputGroup],
      props: otherProps,
    });
  },
);
