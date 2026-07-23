export function isTabFocused(): boolean | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  try {
    if (typeof document.hasFocus !== 'function') {
      return undefined;
    }

    return document.hasFocus();
  } catch {
    return undefined;
  }
}
