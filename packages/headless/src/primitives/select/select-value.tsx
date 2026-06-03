'use client';

import type { ReactNode } from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import type { SelectItem } from './select-context';
import { useSelectContext } from './select-context';

function resolveLabel(
  value: string | undefined,
  items: SelectItem[] | undefined,
  valueToLabelRef: React.MutableRefObject<Map<string, string>>,
): string | null {
  if (value === undefined) return null;
  if (items) {
    const item = items.find(i => i.value === value);
    if (item) return item.label;
  }
  const label = valueToLabelRef.current.get(value);
  if (label) return label;
  return value;
}

export interface SelectValueProps extends ComponentProps<'span'> {
  placeholder?: ReactNode;
}

export function SelectValue(props: SelectValueProps) {
  const { render, placeholder, ...otherProps } = props;
  const { selectedValue, selectedLabel, items, valueToLabelRef } = useSelectContext();

  const displayText =
    selectedValue !== undefined ? (selectedLabel ?? resolveLabel(selectedValue, items, valueToLabelRef)) : placeholder;

  const defaultProps = {
    'data-cl-slot': 'select-value',
    children: displayText,
  };

  return renderElement({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(defaultProps, otherProps),
  });
}
