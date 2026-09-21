'use client';

import { inertProps } from '@clerk/shared/inert';
import React, { useCallback, useEffect, useRef } from 'react';

import { useTransition } from '../hooks/use-transition';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import { TagContext, useTagInputContext } from './tag-input-context';
import { readingDirectionKeys } from './tag-input-utils';

export interface TagInputTagProps extends ComponentProps<'div'> {
  value: string;
}

export const TagInputTag = React.forwardRef<HTMLDivElement, TagInputTagProps>(
  function TagInputTag(props, forwardedRef) {
    const { render, value: tagValue, ...otherProps } = props;
    const { value, tags, disabled, remove, focusInput, focusTag, registerTag, onTagExited } = useTagInputContext();

    const present = value.includes(tagValue);
    const invalid = tags.find(tag => tag.value === tagValue)?.invalid ?? false;

    const elementRef = useRef<HTMLDivElement | null>(null);
    const { mounted, transitionProps } = useTransition({ open: present, ref: elementRef });

    useEffect(() => {
      if (!mounted) {
        onTagExited(tagValue);
      }
    }, [mounted, onTagExited, tagValue]);

    useEffect(() => () => onTagExited(tagValue), [onTagExited, tagValue]);

    const registerRef = useCallback(
      (element: HTMLDivElement | null) => {
        elementRef.current = element;
        registerTag(tagValue, element);
      },
      [registerTag, tagValue],
    );

    const state = { invalid, disabled };

    const defaultProps: Record<string, unknown> = {
      ...transitionProps,
      ...inertProps(!present),
      role: 'listitem',
      tabIndex: -1,
      'data-value': tagValue,
      'aria-hidden': present ? undefined : true,
      onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) {
          return;
        }
        const index = value.indexOf(tagValue);
        const { previousKey, nextKey } = readingDirectionKeys(event.currentTarget);

        switch (event.key) {
          case previousKey:
            event.preventDefault();
            focusTag(value[index - 1]);
            return;
          case nextKey: {
            event.preventDefault();
            const next = value[index + 1];
            if (next === undefined) {
              focusInput();
            } else {
              focusTag(next);
            }
            return;
          }
          case 'Home':
            event.preventDefault();
            focusTag(value[0]);
            return;
          case 'End':
            event.preventDefault();
            focusTag(value[value.length - 1]);
            return;
          case 'Backspace':
          case 'Delete':
            event.preventDefault();
            if (!disabled) {
              remove(tagValue, event.key === 'Backspace' ? 'previous' : 'next');
            }
            return;
          default:
            return;
        }
      },
    };

    const element = useRender({
      defaultTagName: 'div',
      render,
      ref: [registerRef, forwardedRef],
      state,
      stateAttributesMapping: {
        invalid: (v: boolean) => (v ? { 'data-invalid': '' } : null),
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: mergeProps<'div'>(defaultProps, otherProps),
    });

    if (!mounted) {
      return null;
    }

    return <TagContext.Provider value={tagValue}>{element}</TagContext.Provider>;
  },
);
