'use client';

import { createContext, useContext, useId } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';

const SelectGroupContext = createContext<string | undefined>(undefined);

export type SelectGroupProps = ComponentProps<'div'>;

export function SelectGroup(props: SelectGroupProps) {
  const { render, ...otherProps } = props;
  const labelId = useId();

  const defaultProps = {
    role: 'group' as const,
    'aria-labelledby': labelId,
  };

  return (
    <SelectGroupContext.Provider value={labelId}>
      {useRender({
        defaultTagName: 'div',
        render,
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </SelectGroupContext.Provider>
  );
}

export type SelectGroupLabelProps = ComponentProps<'div'>;

export function SelectGroupLabel(props: SelectGroupLabelProps) {
  const { render, ...otherProps } = props;
  const labelId = useContext(SelectGroupContext);
  if (labelId === undefined) {
    throw new Error('Select.GroupLabel must be used within <Select.Group>');
  }

  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>({ id: labelId }, otherProps),
  });
}
