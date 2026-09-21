'use client';

import React, { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import {
  type FocusAfterRemove,
  TagInputContext,
  type TagInputContextValue,
  type TagInputTag,
} from './tag-input-context';
import { mergeRenderList } from './tag-input-utils';

const EMPTY: string[] = [];
const DEFAULT_DELIMITERS = [','];

export interface TagInputProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  validate?: (value: string) => boolean;
  delimiters?: string[];
  name?: string;
  disabled?: boolean;
  children: ReactNode;
}

export const TagInputRoot = React.forwardRef<HTMLDivElement, TagInputProps>(function TagInputRoot(props, forwardedRef) {
  const {
    render,
    value: valueProp,
    defaultValue = EMPTY,
    onValueChange,
    validate,
    delimiters = DEFAULT_DELIMITERS,
    name,
    disabled = false,
    children,
    ...otherProps
  } = props;

  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const valueRef = useRef(value);
  valueRef.current = value;

  const [renderList, setRenderList] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  if (syncedValue !== value) {
    setSyncedValue(value);
    setRenderList(mergeRenderList(renderList, value));
  }

  const inputRef = useRef<HTMLInputElement | null>(null);
  const tagRefs = useRef(new Map<string, HTMLElement>());

  const registerInput = useCallback((element: HTMLInputElement | null) => {
    inputRef.current = element;
  }, []);

  const registerTag = useCallback((tagValue: string, element: HTMLElement | null) => {
    if (element) {
      tagRefs.current.set(tagValue, element);
    } else {
      tagRefs.current.delete(tagValue);
    }
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const focusTag = useCallback((tagValue: string | undefined) => {
    if (tagValue !== undefined) {
      tagRefs.current.get(tagValue)?.focus();
    }
  }, []);

  const add = useCallback(
    (values: string[]) => {
      const current = valueRef.current;
      const next = [...current];
      for (const candidate of values) {
        const trimmed = candidate.trim();
        if (trimmed && !next.includes(trimmed)) {
          next.push(trimmed);
        }
      }
      if (next.length !== current.length) {
        setValue(next);
      }
    },
    [setValue],
  );

  const remove = useCallback(
    (tagValue: string, focusAfter: FocusAfterRemove) => {
      const current = valueRef.current;
      const index = current.indexOf(tagValue);
      if (index === -1) {
        return;
      }
      const previous = current[index - 1];
      const next = current[index + 1];
      const target = focusAfter === 'previous' ? (previous ?? next) : focusAfter === 'next' ? next : undefined;
      if (target === undefined) {
        focusInput();
      } else {
        focusTag(target);
      }
      setValue(current.filter(item => item !== tagValue));
    },
    [setValue, focusInput, focusTag],
  );

  const onTagExited = useCallback((tagValue: string) => {
    if (!valueRef.current.includes(tagValue)) {
      setRenderList(list => list.filter(item => item !== tagValue));
    }
  }, []);

  const tags = useMemo<TagInputTag[]>(
    () =>
      renderList.map(item => ({
        value: item,
        present: value.includes(item),
        invalid: validate ? !validate(item) : false,
      })),
    [renderList, value, validate],
  );

  const contextValue = useMemo<TagInputContextValue>(
    () => ({
      value,
      tags,
      delimiters,
      disabled,
      add,
      remove,
      focusInput,
      focusTag,
      registerInput,
      registerTag,
      onTagExited,
    }),
    [value, tags, delimiters, disabled, add, remove, focusInput, focusTag, registerInput, registerTag, onTagExited],
  );

  const state = { disabled, empty: value.length === 0 };

  const defaultProps: Record<string, unknown> = {
    onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !(event.target instanceof Element) || event.target.closest('input, [role="listitem"]')) {
        return;
      }
      event.preventDefault();
      focusInput();
    },
    children: (
      <>
        {children}
        {name
          ? value.map(item => (
              <input
                key={item}
                type='hidden'
                name={name}
                value={item}
                disabled={disabled}
              />
            ))
          : null}
      </>
    ),
  };

  return (
    <TagInputContext.Provider value={contextValue}>
      {useRender({
        defaultTagName: 'div',
        render,
        ref: forwardedRef,
        state,
        stateAttributesMapping: {
          disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
          empty: (v: boolean) => (v ? { 'data-empty': '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </TagInputContext.Provider>
  );
});
