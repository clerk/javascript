'use client';

import { ComboboxRootInternal, type ComboboxRootInternalProps } from '../autocomplete/autocomplete-root';

export type ComboboxProps = Omit<ComboboxRootInternalProps, 'allowsCustomValue'>;

export function ComboboxRoot(props: ComboboxProps) {
  return (
    <ComboboxRootInternal
      {...props}
      allowsCustomValue={false}
    />
  );
}
