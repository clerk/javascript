'use client';

import React, { useState } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useTagInputContext } from './tag-input-context';
import { readingDirectionKeys, splitTags } from './tag-input-utils';

export type TagInputInputProps = Omit<ComponentProps<'input'>, 'value' | 'defaultValue'>;

export const TagInputInput = React.forwardRef<HTMLInputElement, TagInputInputProps>(
  function TagInputInput(props, forwardedRef) {
    const { render, ...otherProps } = props;
    const { value, delimiters, disabled, add, focusTag, registerInput } = useTagInputContext();
    const [text, setText] = useState('');

    const commit = () => {
      add([text]);
      setText('');
    };

    const defaultProps: Record<string, unknown> = {
      type: 'text',
      value: text,
      disabled,
      autoComplete: 'off',
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const parts = splitTags(event.currentTarget.value, delimiters);
        const pending = parts.pop() ?? '';
        add(parts);
        setText(pending);
      },
      onPaste: (event: React.ClipboardEvent<HTMLInputElement>) => {
        const parts = splitTags(event.clipboardData.getData('text'), delimiters);
        if (parts.length < 2) {
          return;
        }
        event.preventDefault();
        add([text, ...parts]);
        setText('');
      },
      onBlur: commit,
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          if (text.trim()) {
            event.preventDefault();
            commit();
          }
          return;
        }

        const { selectionStart, selectionEnd } = event.currentTarget;
        const caretAtStart = selectionStart === 0 && selectionEnd === 0;
        const { previousKey } = readingDirectionKeys(event.currentTarget);
        if ((event.key === 'Backspace' || event.key === previousKey) && caretAtStart && value.length > 0) {
          event.preventDefault();
          focusTag(value[value.length - 1]);
        }
      },
    };

    return useRender({
      defaultTagName: 'input',
      render,
      ref: [registerInput, forwardedRef],
      props: mergeProps<'input'>(defaultProps, otherProps),
    });
  },
);
