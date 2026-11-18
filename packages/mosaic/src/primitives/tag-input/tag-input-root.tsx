'use client';

import React, { type ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { readingDirectionKeys, useDirection } from '../direction-provider';
import { useComposite } from '../hooks/use-composite';
import { useControllableState } from '../hooks/use-controllable-state';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
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
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (inputValue: string) => void;
  validate?: (value: string) => boolean;
  delimiters?: string[];
  name?: string;
  form?: string;
  disabled?: boolean;
  focusableWhenDisabled?: boolean;
  children: ReactNode;
}

export const TagInputRoot = React.forwardRef<HTMLDivElement, TagInputProps>(function TagInputRoot(props, forwardedRef) {
  const {
    render,
    value: valueProp,
    defaultValue = EMPTY,
    onValueChange,
    inputValue: inputValueProp,
    defaultInputValue = '',
    onInputValueChange,
    validate,
    delimiters = DEFAULT_DELIMITERS,
    name,
    form,
    disabled = false,
    focusableWhenDisabled = false,
    children,
    ...otherProps
  } = props;

  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const [inputValue, setInputValue] = useControllableState(inputValueProp, defaultInputValue, onInputValueChange);
  const valueRef = useRef(value);
  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

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

  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const direction = useDirection();
  const { previousKey, nextKey } = readingDirectionKeys(direction);
  const presentTags = () => value.flatMap(tagValue => tagRefs.current.get(tagValue) ?? []);

  const composite = useComposite(element, {
    getItems: presentTags,
    orientation: 'horizontal',
    loop: false,
    rtl: direction === 'rtl',
    stopPropagation: 'none',
    syncTabIndexes: () => {},
    getNextItem: (event, target, defaultNext) => {
      const tags = presentTags();
      if (event.key === nextKey && target === tags.at(-1)) {
        return inputRef.current;
      }
      if (event.key === previousKey && target === tags[0]) {
        event.preventDefault();
        return null;
      }
      return defaultNext();
    },
  });

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
      const next = [...value];
      for (const candidate of values) {
        const trimmed = candidate.trim();
        if (trimmed && !next.includes(trimmed)) {
          next.push(trimmed);
        }
      }
      if (next.length !== value.length) {
        setValue(next);
      }
    },
    [setValue, value],
  );

  const remove = useCallback(
    (tagValue: string, focusAfter: FocusAfterRemove) => {
      const index = value.indexOf(tagValue);
      if (index === -1) {
        return;
      }
      const previous = value[index - 1];
      const next = value[index + 1];
      const target = focusAfter === 'previous' ? (previous ?? next) : focusAfter === 'next' ? next : undefined;
      if (target === undefined) {
        focusInput();
      } else {
        focusTag(target);
      }
      setValue(value.filter(item => item !== tagValue));
    },
    [setValue, focusInput, focusTag, value],
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
      inputValue,
      setInputValue,
      delimiters,
      disabled,
      focusableWhenDisabled,
      add,
      remove,
      focusInput,
      focusTag,
      registerInput,
      registerTag,
      onTagExited,
      navigateFromTag: composite.handleKeyDown,
    }),
    [
      value,
      tags,
      inputValue,
      setInputValue,
      delimiters,
      disabled,
      focusableWhenDisabled,
      add,
      remove,
      focusInput,
      focusTag,
      registerInput,
      registerTag,
      onTagExited,
      composite.handleKeyDown,
    ],
  );

  const state = { disabled, empty: value.length === 0 };

  const defaultProps = {
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
                form={form}
                value={item}
                disabled={disabled}
              />
            ))
          : null}
      </>
    ),
  } satisfies DefaultProps<'div'>;

  return (
    <TagInputContext.Provider value={contextValue}>
      {useRender({
        defaultTagName: 'div',
        render,
        ref: [setElement, forwardedRef],
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
