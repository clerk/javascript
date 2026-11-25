'use client';

import React from 'react';

import { MenuRadioItemContext, useMenuRadioGroupContext } from './menu-checkable-context';
import { MenuItem, type MenuItemProps } from './menu-item';

export interface MenuRadioItemProps extends MenuItemProps {
  value: string;
}

export const MenuRadioItem = React.forwardRef<HTMLButtonElement, MenuRadioItemProps>(
  function MenuRadioItem(props, ref) {
    const { value, closeOnClick = false, disabled: disabledProp = false, onClick, ...otherProps } = props;
    const group = useMenuRadioGroupContext();
    const checked = group.value === value;
    const disabled = group.disabled || disabledProp;
    const state = React.useMemo(() => ({ checked, disabled }), [checked, disabled]);

    return (
      <MenuRadioItemContext.Provider value={state}>
        <MenuItem
          ref={ref}
          role='menuitemradio'
          aria-checked={checked}
          data-checked={checked ? '' : undefined}
          data-unchecked={checked ? undefined : ''}
          {...otherProps}
          disabled={disabled}
          closeOnClick={closeOnClick}
          onClick={event => {
            group.setValue(value);
            onClick?.(event);
          }}
        />
      </MenuRadioItemContext.Provider>
    );
  },
);
