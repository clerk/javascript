'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useTagInputContext, useTagValue } from './tag-input-context';

export type TagInputTagRemoveProps = ComponentProps<'button'>;

export const TagInputTagRemove = React.forwardRef<HTMLButtonElement, TagInputTagRemoveProps>(
  function TagInputTagRemove(props, forwardedRef) {
    const { render, ...otherProps } = props;
    const { disabled, remove } = useTagInputContext();
    const tagValue = useTagValue();

    const defaultProps = {
      type: 'button',
      tabIndex: -1,
      disabled,
      'aria-label': `Remove ${tagValue}`,
      onClick: () => {
        if (!disabled) {
          remove(tagValue, 'input');
        }
      },
    } satisfies DefaultProps<'button'>;

    return useRender({
      defaultTagName: 'button',
      render,
      ref: forwardedRef,
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
