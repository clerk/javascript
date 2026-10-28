'use client';

import { useCallback, useState } from 'react';

/**
 * Manages a value that can be either controlled (externally owned) or
 * uncontrolled (internally owned). When `controlled` is `undefined`, the
 * hook stores the value internally; otherwise it defers to the caller.
 *
 * `onChange` is always called on updates regardless of mode.
 */
export function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [value, setValue];
}
