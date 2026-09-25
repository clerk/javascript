import { createContext, useContext } from 'react';

import type { OtpPattern } from './otp-utils';

/** A single Otp slot, as read through {@link useOtp}. */
export interface OtpSlot {
  /** The slot's position, `0`-based. */
  index: number;
  /** The character in this slot, or `''` when empty. */
  char: string;
  /** Whether this slot currently holds the focus. */
  isActive: boolean;
  /** Whether this slot holds a character. */
  isFilled: boolean;
}

/** The naming attributes the first slot inherits from `<Otp.Root>`. */
export type FirstInputLabel = { 'aria-labelledby': string } | { 'aria-label': string };

export interface OtpContextValue {
  /** The current Otp value. */
  value: string;
  /** The number of slots. */
  length: number;
  /** Whether the whole field is disabled. */
  disabled: boolean;
  /** Whether every slot must be filled before the enclosing form submits. */
  required: boolean;
  /** Whether every slot is filled. */
  complete: boolean;
  /** The allowed character set. */
  pattern: OtpPattern;
  /** Render each slot as a masked (password) input. */
  mask: boolean;
  /** One descriptor per slot, in order. */
  slots: OtpSlot[];
  /** The index of the currently focused slot, or `null` when unfocused. */
  activeIndex: number | null;
  /** Clear the value and focus the first slot. */
  clear: () => void;
  /** Focus the slot at `index` (clamped to range). */
  focus: (index: number) => void;
  // --- internal wiring used by <Otp.Input> ---
  /** The `id` for the slot at `index`. Slot `0` takes the root's `id` so a `<label>` can target it. */
  getInputId: (index: number) => string;
  /**
   * The accessible name the first slot inherits from the root, or `undefined` when the root
   * carries no name of its own and the slot is left to a native `<label>`.
   */
  firstInputLabel: FirstInputLabel | undefined;
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

export const OtpContext = createContext<OtpContextValue | null>(null);

export function useOtpContext(): OtpContextValue {
  const ctx = useContext(OtpContext);
  if (!ctx) {
    throw new Error('Otp compound components must be used within <Otp.Root>');
  }
  return ctx;
}

/**
 * Reads the current Otp state and actions. Use it to render one
 * `<Otp.Input>` per slot, show a completion state, or drive a custom clear
 * button. Must be called inside `<Otp.Root>`.
 */
export function useOtp(): Pick<
  OtpContextValue,
  'value' | 'length' | 'disabled' | 'complete' | 'slots' | 'activeIndex' | 'clear' | 'focus'
> {
  const { value, length, disabled, complete, slots, activeIndex, clear, focus } = useOtpContext();
  return { value, length, disabled, complete, slots, activeIndex, clear, focus };
}
