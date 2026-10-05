import { canScrollToward } from '../../primitives/utils';

/**
 * Cancels a one-finger drag inside a dialog unless something under it can scroll that way. With
 * the keyboard up, iOS otherwise pans the visual viewport over the page; with it down, the same
 * drag would only rubber-band a scroll-locked page, so every dialog takes it.
 */
export function preventViewportPan(element: HTMLElement): () => void {
  let startX = 0;
  let startY = 0;
  const onTouchStart = (event: TouchEvent) => {
    startX = event.touches[0]?.clientX ?? 0;
    startY = event.touches[0]?.clientY ?? 0;
  };
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (event.touches.length > 1 || !touch || !event.cancelable) {
      return;
    }
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    for (let node = event.target instanceof Element ? event.target : null; node; node = node.parentElement) {
      if ((node instanceof HTMLInputElement && node.type === 'range') || canScrollToward(node, deltaX, deltaY)) {
        return;
      }
    }
    event.preventDefault();
  };
  element.addEventListener('touchstart', onTouchStart, { passive: true });
  element.addEventListener('touchmove', onTouchMove, { passive: false });
  return () => {
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchmove', onTouchMove);
  };
}
