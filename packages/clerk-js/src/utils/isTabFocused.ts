import { isNativeApplicationActive } from '@clerk/shared/network';

export function isTabFocused(): boolean | undefined {
  const active = isNativeApplicationActive();
  if (active !== undefined) return active;
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

export const getTabState = (): 'focused' | 'visible' | 'hidden' | undefined => {
  const focused = isTabFocused();
  if (focused === undefined) {
    return undefined;
  }
  if (focused) {
    return 'focused';
  }

  if (isNativeApplicationActive() === false) return 'hidden';

  try {
    return document.visibilityState === 'visible' ? 'visible' : 'hidden';
  } catch {
    return undefined;
  }
};
