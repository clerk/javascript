'use client';

import React, { useCallback } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useOtpContext } from './otp-context';
import { inputModeForPattern, removeAt, replaceAt, sanitize } from './otp-utils';

export interface OtpInputProps extends ComponentProps<'input'> {
  /** This slot's position, `0`-based (typically from `useOtp().slots`). */
  index: number;
}

export const OtpInput = React.forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(props, forwardedRef) {
  const { render, index, ...otherProps } = props;
  const {
    value,
    length,
    disabled,
    pattern,
    mask,
    activeIndex,
    setValue,
    queueFocus,
    focus,
    registerInput,
    onSlotFocus,
    onSlotBlur,
  } = useOtpContext();

  const char = value[index] ?? '';

  // Register this slot for programmatic focus, keyed by index.
  const registerRef = useCallback<(element: HTMLInputElement | null) => void>(
    element => registerInput(index, element),
    [registerInput, index],
  );

  // Roving tab order: the focused slot is the tab stop, or the next empty slot
  // when the field is unfocused, so Tab enters and leaves the group once.
  const tabStop = activeIndex ?? Math.min(value.length, length - 1);

  const state = { active: activeIndex === index, filled: char !== '', disabled };

  const defaultProps: Record<string, unknown> = {
    value: char,
    type: mask ? 'password' : 'text',
    inputMode: inputModeForPattern(pattern),
    // Only the first slot advertises autofill so browsers drop the whole SMS
    // code into it; its onChange then spills the characters across the slots.
    autoComplete: index === 0 ? 'one-time-code' : 'off',
    autoCorrect: 'off',
    spellCheck: false,
    // The first slot accepts the full code (autofill/paste); the rest are
    // single characters handled by onChange/onPaste.
    maxLength: index === 0 ? length : 1,
    tabIndex: tabStop === index ? 0 : -1,
    disabled,
    'aria-label': `Character ${index + 1} of ${length}`,
    onMouseDown: (event: React.MouseEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }
      // Take focus ourselves so a click always selects the slot's character
      // (typing replaces it) instead of dropping a caret mid-value.
      event.preventDefault();
      focus(index);
    },
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
      // Focus can't skip past the first empty slot: any attempt to land on an
      // empty slot beyond it (via click, arrow key, or Tab) snaps to that slot.
      if (index > value.length) {
        focus(Math.min(value.length, length - 1));
        return;
      }
      onSlotFocus(index);
      event.currentTarget.select();
    },
    onBlur: () => {
      onSlotBlur();
    },
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }
      const raw = event.currentTarget.value;

      // Empty means the character was removed (mobile delete, cut, clear).
      if (raw === '') {
        setValue(removeAt(value, index));
        return;
      }

      const inserted = sanitize(raw, pattern, length);
      if (inserted === '') {
        // Only disallowed characters were typed; restore the stored value.
        event.currentTarget.value = char;
        return;
      }

      const next = sanitize(replaceAt(value, index, inserted), pattern, length);
      setValue(next);
      queueFocus(Math.min(index + inserted.length, length - 1), next);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }

      const lastIndex = Math.max(length - 1, 0);
      // The last slot that can hold focus: the last-entered slot, or the first
      // empty one when the value isn't full.
      const endIndex = Math.min(value.length, lastIndex);
      // Ctrl/Cmd (without Alt) turns navigation and delete into boundary actions.
      const boundaryModifier = (event.ctrlKey || event.metaKey) && !event.altKey;

      // Resolve direction from the nearest ancestor with an explicit `dir` so
      // arrow keys follow reading order: in RTL, Left moves to the next slot and
      // Right to the previous one.
      const isRtl = (event.currentTarget.closest('[dir]')?.getAttribute('dir') ?? '').toLowerCase() === 'rtl';
      const previousKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
      const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';

      if (event.key === previousKey) {
        event.preventDefault();
        focus(boundaryModifier ? 0 : index - 1);
        return;
      }
      if (event.key === nextKey) {
        event.preventDefault();
        focus(boundaryModifier ? endIndex : index + 1);
        return;
      }

      switch (event.key) {
        case 'Home':
        case 'ArrowUp': {
          event.preventDefault();
          focus(0);
          return;
        }
        case 'End':
        case 'ArrowDown': {
          event.preventDefault();
          focus(endIndex);
          return;
        }
        case 'Delete': {
          event.preventDefault();
          const next = removeAt(value, index);
          setValue(next);
          queueFocus(index, next);
          return;
        }
        case 'Backspace': {
          event.preventDefault();
          if (boundaryModifier) {
            setValue('');
            queueFocus(0, '');
            return;
          }
          const targetIndex = Math.max(0, index - 1);
          // Delete this slot's character if it has one, otherwise the previous
          // slot's — either way focus lands on the previous slot.
          const deleteIndex = char === '' ? targetIndex : index;
          const next = removeAt(value, deleteIndex);
          setValue(next);
          queueFocus(targetIndex, next);
          return;
        }
        default:
          break;
      }

      // Re-typing the character already in the (fully selected) slot leaves the
      // value unchanged, so onChange won't advance focus — do it here instead.
      const fullSelection =
        event.currentTarget.selectionStart === 0 &&
        event.currentTarget.selectionEnd === event.currentTarget.value.length;
      if (event.key.length === 1 && !boundaryModifier && fullSelection && char === event.key) {
        event.preventDefault();
        focus(index + 1);
      }
    },
    onPaste: (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }
      event.preventDefault();
      const inserted = sanitize(event.clipboardData?.getData('text') ?? '', pattern, length);
      if (inserted === '') {
        return;
      }
      const next = sanitize(replaceAt(value, index, inserted), pattern, length);
      setValue(next);
      queueFocus(Math.min(index + inserted.length, length - 1), next);
    },
  };

  return useRender({
    defaultTagName: 'input',
    render,
    ref: [registerRef, forwardedRef],
    state,
    stateAttributesMapping: {
      active: (v: boolean) => (v ? { 'data-active': '' } : null),
      filled: (v: boolean) => (v ? { 'data-filled': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: mergeProps<'input'>(defaultProps, otherProps),
  });
});
