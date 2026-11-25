'use client';

import React from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { MenuCheckboxItemContext } from './menu-checkable-context';
import { MenuItem, type MenuItemProps } from './menu-item';

export interface MenuCheckboxItemProps extends MenuItemProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const MenuCheckboxItem = React.forwardRef<HTMLButtonElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem(props, ref) {
    const {
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      closeOnClick = false,
      disabled = false,
      onClick,
      ...otherProps
    } = props;
    const [checked, setChecked] = useControllableState(checkedProp, defaultChecked, onCheckedChange);
    const state = React.useMemo(() => ({ checked, disabled }), [checked, disabled]);

    return (
      <MenuCheckboxItemContext.Provider value={state}>
        <MenuItem
          ref={ref}
          role='menuitemcheckbox'
          aria-checked={checked}
          data-checked={checked ? '' : undefined}
          data-unchecked={checked ? undefined : ''}
          {...otherProps}
          disabled={disabled}
          closeOnClick={closeOnClick}
          onClick={event => {
            setChecked(!checked);
            onClick?.(event);
          }}
        />
      </MenuCheckboxItemContext.Provider>
    );
  },
);
