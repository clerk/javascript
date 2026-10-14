'use client';

import type { ReactNode } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import type { SelectItem } from './select-context';
import { useSelectContext } from './select-context';

function resolveLabel(
  value: string,
  items: SelectItem[] | undefined,
  cachedLabels: ReadonlyMap<string, string> | null,
  valueToLabelRef: React.MutableRefObject<Map<string, string>>,
): string {
  return (
    cachedLabels?.get(value) ??
    items?.find(i => i.value === value)?.label ??
    valueToLabelRef.current.get(value) ??
    value
  );
}

export interface SelectValueProps extends Omit<ComponentProps<'span'>, 'children'> {
  placeholder?: ReactNode;
  /** Replaces the selected labels. A function receives the selected values in the order they were picked. */
  children?: ReactNode | ((value: string[]) => ReactNode);
}

export function SelectValue(props: SelectValueProps) {
  const { render, placeholder, children, ...otherProps } = props;
  const { selectedValues, cachedLabels, items, valueToLabelRef } = useSelectContext();

  let displayText: ReactNode;
  if (typeof children === 'function') {
    displayText = children(selectedValues);
  } else if (children != null) {
    displayText = children;
  } else if (selectedValues.length === 0) {
    displayText = placeholder;
  } else {
    displayText = selectedValues.map(value => resolveLabel(value, items, cachedLabels, valueToLabelRef)).join(', ');
  }

  const defaultProps = {
    children: displayText,
  };

  return useRender({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(defaultProps, otherProps),
  });
}
