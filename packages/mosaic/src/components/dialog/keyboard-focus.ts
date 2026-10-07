import { opensKeyboard } from '../../primitives/utils';

const KEYBOARD_THRESHOLD = 60;

function keyboardBand(): { top: number; bottom: number } | null {
  const viewport = window.visualViewport;
  if (!viewport || viewport.scale !== 1) {
    return null;
  }
  const height = document.documentElement.clientHeight;
  if (height - viewport.height <= KEYBOARD_THRESHOLD) {
    return null;
  }
  const top = Math.max(0, viewport.offsetTop);
  return { top, bottom: Math.min(height, top + viewport.height) };
}

function overrideGeometry(element: HTMLElement, translateY: number): () => void {
  const { opacity, transform, transition } = element.style;
  element.style.transition = 'none';
  element.style.opacity = '0';
  element.style.transform = `translateY(${translateY}px)`;
  return () => {
    element.style.opacity = opacity;
    element.style.transform = transform;
    element.style.transition = transition;
  };
}

export function guardKeyboardFocus(element: HTMLElement): () => void {
  const baseX = window.scrollX;
  const baseY = window.scrollY;
  let restore: (() => void) | null = null;
  let frame = 0;

  const release = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    restore?.();
    restore = null;
  };
  const onFocusOut = (event: FocusEvent) => {
    release();
    const next = event.relatedTarget;
    const band = keyboardBand();
    if (!band || !opensKeyboard(next) || !element.contains(next)) {
      return;
    }
    const rect = next.getBoundingClientRect();
    restore = overrideGeometry(next, (band.top + band.bottom - rect.top - rect.bottom) / 2);
    frame = requestAnimationFrame(release);
  };
  const onScroll = () => {
    const active = document.activeElement;
    if (window.scrollX === baseX && window.scrollY === baseY) {
      return;
    }
    if (!keyboardBand() || !opensKeyboard(active) || !element.contains(active)) {
      return;
    }
    window.scrollTo({ left: baseX, top: baseY, behavior: 'instant' });
  };

  element.addEventListener('focusout', onFocusOut);
  element.addEventListener('focusin', release);
  window.addEventListener('scroll', onScroll);
  return () => {
    release();
    element.removeEventListener('focusout', onFocusOut);
    element.removeEventListener('focusin', release);
    window.removeEventListener('scroll', onScroll);
  };
}
