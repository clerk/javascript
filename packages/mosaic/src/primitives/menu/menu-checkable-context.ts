import { createContext, useContext } from 'react';

export type MenuCheckableItemState = {
  checked: boolean;
  disabled: boolean;
};

export interface MenuRadioGroupContextValue {
  value: string | undefined;
  setValue: (value: string) => void;
  disabled: boolean;
}

export const MenuCheckboxItemContext = createContext<MenuCheckableItemState | null>(null);
export const MenuRadioItemContext = createContext<MenuCheckableItemState | null>(null);
export const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);

export function useMenuCheckboxItemContext() {
  const ctx = useContext(MenuCheckboxItemContext);
  if (!ctx) {
    throw new Error('Menu.CheckboxItemIndicator must be used within <Menu.CheckboxItem>');
  }
  return ctx;
}

export function useMenuRadioItemContext() {
  const ctx = useContext(MenuRadioItemContext);
  if (!ctx) {
    throw new Error('Menu.RadioItemIndicator must be used within <Menu.RadioItem>');
  }
  return ctx;
}

export function useMenuRadioGroupContext() {
  const ctx = useContext(MenuRadioGroupContext);
  if (!ctx) {
    throw new Error('Menu.RadioItem must be used within <Menu.RadioGroup>');
  }
  return ctx;
}
