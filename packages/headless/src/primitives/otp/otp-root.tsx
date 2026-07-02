'use client';

import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { OTPContext, type OTPContextValue, type OTPSlot } from './otp-context';
import { inputModeForPattern, type OTPPattern, sanitize } from './otp-utils';

export interface OTPProps extends Omit<ComponentProps<'div'>, 'value' | 'defaultValue' | 'onChange'> {
  /** The number of slots (characters) in the code. */
  length: number;
  /** Controlled value. */
  value?: string;
  /** Initial value (uncontrolled). @default '' */
  defaultValue?: string;
  /** Called with the full value whenever it changes. */
  onValueChange?: (value: string) => void;
  /** Called with the value once every slot is filled. */
  onComplete?: (value: string) => void;
  /** Allowed character set; other characters are stripped. @default 'numeric' */
  pattern?: OTPPattern;
  /** Render slots as masked (password) inputs. @default false */
  mask?: boolean;
  /**
   * Submits the value as a hidden input under this `name`, so the field works
   * inside a plain `<form>`. Omit for controlled-only use.
   */
  name?: string;
  /** Disable every slot and the picker. @default false */
  disabled?: boolean;
  children: ReactNode;
}

// The form value rides on a hidden input; the visible slots carry no name so
// only the combined value is submitted.
const visuallyHiddenInputStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function OTPRoot(props: OTPProps) {
  const {
    render,
    length,
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onComplete,
    pattern = 'numeric',
    mask = false,
    name,
    disabled = false,
    children,
    ...otherProps
  } = props;

  const [rawValue, setRawValue] = useControllableState(valueProp, defaultValue, onValueChange);
  // Never let out-of-range or disallowed characters reach the slots, even from a
  // controlled/default value the consumer passes in.
  const value = sanitize(rawValue, pattern, length);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const pendingFocusRef = useRef<{ index: number; afterValue: string } | null>(null);
  const previousValueRef = useRef(value);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const registerInput = useCallback((index: number, element: HTMLInputElement | null) => {
    inputRefs.current[index] = element;
  }, []);

  const focus = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), Math.max(length - 1, 0));
      const target = inputRefs.current[clamped];
      target?.focus();
      target?.select();
    },
    [length],
  );

  const setValue = useCallback(
    (next: string) => {
      setRawValue(sanitize(next, pattern, length));
    },
    [setRawValue, pattern, length],
  );

  const queueFocus = useCallback((index: number, afterValue: string) => {
    pendingFocusRef.current = { index, afterValue };
  }, []);

  const clear = useCallback(() => {
    setValue('');
    queueFocus(0, '');
  }, [setValue, queueFocus]);

  const onSlotFocus = useCallback((index: number) => setActiveIndex(index), []);
  const onSlotBlur = useCallback(() => setActiveIndex(null), []);

  // Apply a queued focus move once the value it was queued against is live, so
  // focus lands after React has re-rendered the slots with the new characters.
  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (pending && pending.afterValue === value) {
      pendingFocusRef.current = null;
      focus(pending.index);
    }
  }, [value, focus]);

  // Fire `onComplete` on the transition into a full value (typing the last
  // character or pasting a full code), not on every keystroke while full.
  useEffect(() => {
    if (previousValueRef.current.length < length && value.length === length) {
      onComplete?.(value);
    }
    previousValueRef.current = value;
  }, [value, length, onComplete]);

  const complete = value.length === length;

  const slots = useMemo<OTPSlot[]>(
    () =>
      Array.from({ length }, (_, index) => {
        const char = value[index] ?? '';
        return { index, char, isActive: activeIndex === index, isFilled: char !== '' };
      }),
    [length, value, activeIndex],
  );

  const contextValue = useMemo<OTPContextValue>(
    () => ({
      value,
      length,
      disabled,
      complete,
      pattern,
      mask,
      slots,
      activeIndex,
      clear,
      focus,
      registerInput,
      setValue,
      queueFocus,
      onSlotFocus,
      onSlotBlur,
    }),
    [
      value,
      length,
      disabled,
      complete,
      pattern,
      mask,
      slots,
      activeIndex,
      clear,
      focus,
      registerInput,
      setValue,
      queueFocus,
      onSlotFocus,
      onSlotBlur,
    ],
  );

  const state = { disabled, complete, empty: value.length === 0 };

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'otp-root',
    role: 'group',
    children: (
      <>
        {children}
        {name ? (
          <input
            type='text'
            name={name}
            value={value}
            readOnly
            aria-hidden='true'
            tabIndex={-1}
            autoComplete='one-time-code'
            inputMode={inputModeForPattern(pattern)}
            data-cl-slot='otp-hidden-input'
            style={visuallyHiddenInputStyle}
          />
        ) : null}
      </>
    ),
  };

  return (
    <OTPContext.Provider value={contextValue}>
      {renderElement({
        defaultTagName: 'div',
        render,
        state,
        stateAttributesMapping: {
          disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
          complete: (v: boolean) => (v ? { 'data-cl-complete': '' } : null),
          empty: (v: boolean) => (v ? { 'data-cl-empty': '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </OTPContext.Provider>
  );
}
