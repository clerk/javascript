/**
 * Check if a value is enabled
 *
 * @param value - The value to check
 * @returns boolean - Whether the value is enabled
 */
export function isEnabled(value: boolean | number | string | undefined): boolean {
  if (value === true || value === 'true' || value === '1' || value === 1) {
    return true;
  }

  return false;
}
