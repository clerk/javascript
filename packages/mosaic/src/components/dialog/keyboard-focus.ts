import { opensKeyboard } from '../../primitives/utils';
import { measureKeyboardInset } from './keyboard-inset';

export function guardKeyboardFocus(element: HTMLElement): () => void {
  const viewport = window.visualViewport;
  if (!viewport) {
    return () => {};
  }

  const onFocusIn = (event: FocusEvent) => {
    if (opensKeyboard(event.target)) {
      revealAboveKeyboard(event.target, element, viewport);
    }
  };
  const onResize = () => {
    const active = document.activeElement;
    if (opensKeyboard(active) && element.contains(active)) {
      revealAboveKeyboard(active, element, viewport);
    }
  };
  let redirecting = false;
  const onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget;
    if (redirecting || !opensKeyboard(next) || !element.contains(next) || measureKeyboardInset() === 0) {
      return;
    }
    redirecting = true;
    next.focus({ preventScroll: true });
    redirecting = false;
  };
  const pinned = { left: window.scrollX, top: window.scrollY };
  const onWindowScroll = () => {
    if (measureKeyboardInset() === 0 || (window.scrollX === pinned.left && window.scrollY === pinned.top)) {
      return;
    }
    window.scrollTo({ ...pinned, behavior: 'instant' });
  };

  element.addEventListener('focusin', onFocusIn);
  element.addEventListener('blur', onBlur, true);
  viewport.addEventListener('resize', onResize);
  window.addEventListener('scroll', onWindowScroll);
  return () => {
    element.removeEventListener('focusin', onFocusIn);
    element.removeEventListener('blur', onBlur, true);
    viewport.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onWindowScroll);
  };
}

function revealAboveKeyboard(field: HTMLElement, boundary: HTMLElement, viewport: VisualViewport): void {
  const scroller = scrollParent(field, boundary);
  if (!scroller || measureKeyboardInset() === 0) {
    return;
  }
  const bounds = scroller.getBoundingClientRect();
  const target = field.getBoundingClientRect();
  const bottom = Math.min(bounds.bottom, viewport.offsetTop + viewport.height);
  if (target.top >= bounds.top && target.bottom <= bottom) {
    return;
  }
  const centered = scroller.scrollTop + target.top - bounds.top - ((bottom - bounds.top) / 2 - target.height / 2);
  scroller.scrollTo({
    top: Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, centered)),
    behavior: 'smooth',
  });
}

function scrollParent(field: HTMLElement, boundary: HTMLElement): HTMLElement | null {
  for (let node = field.parentElement; node && boundary.contains(node); node = node.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return null;
}
