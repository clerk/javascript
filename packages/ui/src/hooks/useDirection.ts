function getDirectionFromElement(element: HTMLElement): 'ltr' | 'rtl' {
  const dir = element.dir;

  if (dir === 'rtl') {
    return 'rtl';
  }

  if (dir === 'ltr') {
    return 'ltr';
  }

  if (dir === 'auto' || !dir) {
    const computedDirection = window.getComputedStyle(element).direction;
    if (computedDirection === 'rtl') {
      return 'rtl';
    }
  }

  return 'ltr';
}

export function useDirection(element?: HTMLElement) {
  if (typeof window === 'undefined') {
    return 'ltr';
  }

  if (element) {
    return getDirectionFromElement(element);
  }

  return getDirectionFromElement(document.documentElement);
}
