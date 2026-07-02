import { createContext, useContext } from 'react';

import type { OTPPattern } from './otp-utils';

/** A single OTP slot, as read through {@link useOTP}. */
export interface OTPSlot {
  /** The slot's position, `0`-based. */
  index: number;
  /** The character in this slot, or `''` when empty. */
  char: string;
  /** Whether this slot currently holds the focus. */
  isActive: boolean;
  /** Whether this slot holds a character. */
  isFilled: boolean;
}

export interface OTPContextValue {
  /** The current OTP value. */
  value: string;
  /** The number of slots. */
  length: number;
  /** Whether the whole field is disabled. */
  disabled: boolean;
  /** Whether every slot is filled. */
  complete: boolean;
  /** The allowed character set. */
  pattern: OTPPattern;
  /** Render each slot as a masked (password) input. */
  mask: boolean;
  /** One descriptor per slot, in order. */
  slots: OTPSlot[];
  /** The index of the currently focused slot, or `null` when unfocused. */
  activeIndex: number | null;
  /** Clear the value and focus the first slot. */
  clear: () => void;
  /** Focus the slot at `index` (clamped to range). */
  focus: (index: number) => void;
  // --- internal wiring used by <OTP.Input> ---
  /** Register/unregister a slot input's element by index. */
  registerInput: (index: number, element: HTMLInputElement | null) => void;
  /** Propose a new full value; it is sanitized and clamped before commit. */
  setValue: (next: string) => void;
  /** Queue a focus move to run once `value` reflects `afterValue`. */
  queueFocus: (index: number, afterValue: string) => void;
  /** Report that slot `index` gained focus. */
  onSlotFocus: (index: number) => void;
  /** Report that a slot lost focus (blurred outside the field). */
  onSlotBlur: () => void;
}

export const OTPContext = createContext<OTPContextValue | null>(null);

export function useOTPContext(): OTPContextValue {
  const ctx = useContext(OTPContext);
  if (!ctx) {
    throw new Error('OTP compound components must be used within <OTP.Root>');
  }
  return ctx;
}

/**
 * Reads the current OTP state and actions. Use it to render one
 * `<OTP.Input>` per slot, show a completion state, or drive a custom clear
 * button. Must be called inside `<OTP.Root>`.
 */
export function useOTP(): Pick<
  OTPContextValue,
  'value' | 'length' | 'disabled' | 'complete' | 'slots' | 'activeIndex' | 'clear' | 'focus'
> {
  const { value, length, disabled, complete, slots, activeIndex, clear, focus } = useOTPContext();
  return { value, length, disabled, complete, slots, activeIndex, clear, focus };
}
