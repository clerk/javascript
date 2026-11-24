'use client';

import React from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { MenuRadioGroupContext } from './menu-checkable-context';

export interface MenuRadioGroupProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const MenuRadioGroup = React.forwardRef<HTMLDivElement, MenuRadioGroupProps>(
  function MenuRadioGroup(props, ref) {
    const { render, value: valueProp, defaultValue, onValueChange, disabled = false, ...otherProps } = props;
    const [value, setValue] = useControllableState<string | undefined>(valueProp, defaultValue, next => {
      if (next !== undefined) {
        onValueChange?.(next);
      }
    });
    const context = React.useMemo(() => ({ value, setValue, disabled }), [value, setValue, disabled]);

    const ownProps = {
      role: 'group',
      ...(disabled && { 'aria-disabled': true }),
    } satisfies DefaultProps<'div'>;

    const element = useRender({
      defaultTagName: 'div',
      render,
      ref,
      props: mergeProps<'div'>(ownProps, otherProps),
    });

    return <MenuRadioGroupContext.Provider value={context}>{element}</MenuRadioGroupContext.Provider>;
  },
);
