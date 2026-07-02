/** The character set an OTP value is allowed to contain. */
export type OTPPattern = 'numeric' | 'alpha' | 'alphanumeric';

// Each pattern maps to a regex that matches the characters to *strip*.
const DISALLOWED: Record<OTPPattern, RegExp> = {
  numeric: /[^0-9]/g,
  alpha: /[^a-zA-Z]/g,
  alphanumeric: /[^a-zA-Z0-9]/g,
};

/** The `inputMode` best suited to a pattern's on-screen keyboard. */
export function inputModeForPattern(pattern: OTPPattern): 'numeric' | 'text' {
  return pattern === 'numeric' ? 'numeric' : 'text';
}

/**
 * Strips whitespace and any characters disallowed by `pattern`, then clamps the
 * result to `length` characters. Used for every value the field accepts —
 * typing, pasting, and controlled/default values — so state can never hold an
 * out-of-range or overflowing string.
 */
export function sanitize(value: string, pattern: OTPPattern, length: number): string {
  return value.replace(/\s/g, '').replace(DISALLOWED[pattern], '').slice(0, length);
}

/**
 * Overwrites the characters starting at `index` with `insert`, so typing or
 * pasting into a slot replaces that slot onward rather than shifting later
 * characters. The result is re-sanitized by the caller.
 */
export function replaceAt(current: string, index: number, insert: string): string {
  return current.slice(0, index) + insert + current.slice(index + insert.length);
}

/** Removes the character at `index`, closing the gap. */
export function removeAt(current: string, index: number): string {
  if (index < 0 || index >= current.length) {
    return current;
  }
  return current.slice(0, index) + current.slice(index + 1);
}
