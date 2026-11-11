'use client';

import type { ReactNode } from 'react';

import { useComboboxContext } from './combobox-context';

export interface ComboboxValueProps {
  placeholder?: ReactNode;
  /** Replaces the selected labels. A function receives the selected values in the order they were picked. */
  children?: ReactNode | ((value: string[]) => ReactNode);
}

export function ComboboxValue({ placeholder, children }: ComboboxValueProps) {
  const { selectedValues, labelsByValueRef } = useComboboxContext();

  if (typeof children === 'function') {
    return <>{children(selectedValues)}</>;
  }
  if (children != null) {
    return <>{children}</>;
  }
  if (selectedValues.length === 0) {
    return <>{placeholder}</>;
  }
  // eslint-disable-next-line react/refs -- Options write their labels before the selection changes, so this render already sees them.
  return <>{selectedValues.map(value => labelsByValueRef.current.get(value) ?? value).join(', ')}</>;
}
