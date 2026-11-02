'use client';

import React, { createContext, useContext, useId } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';

const SelectGroupContext = createContext<string | undefined>(undefined);

export type SelectGroupProps = ComponentProps<'div'>;

/** A labelled set of options in the listbox, named by the `Select.GroupLabel` inside it. */
export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(function SelectGroup(props, ref) {
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
        ref,
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </SelectGroupContext.Provider>
  );
});

export type SelectGroupLabelProps = ComponentProps<'div'>;

/** Names the `Select.Group` it sits in. Throws outside one. */
export const SelectGroupLabel = React.forwardRef<HTMLDivElement, SelectGroupLabelProps>(
  function SelectGroupLabel(props, ref) {
    const { render, ...otherProps } = props;
    const labelId = useContext(SelectGroupContext);
    if (labelId === undefined) {
      throw new Error('Select.GroupLabel must be used within <Select.Group>');
    }

    return useRender({
      defaultTagName: 'div',
      render,
      ref,
      props: mergeProps<'div'>({ id: labelId }, otherProps),
    });
  },
);
