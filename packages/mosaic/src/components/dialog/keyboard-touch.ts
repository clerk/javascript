import { canScrollToward, opensKeyboard } from '../../primitives/utils';

/** A native slider, or anything that opts out of the browser's panning to take the drag itself. */
function handlesOwnDrag(element: Element): boolean {
  if (element instanceof HTMLInputElement && element.type === 'range') {
    return true;
  }
  const { touchAction } = getComputedStyle(element);
  return touchAction === 'none' || touchAction === 'pinch-zoom';
}

/**
 * The dialog's touch handling around an on-screen keyboard, attached to its track.
 *
 * - A tap on a text field focuses it without the browser's reveal pan. iOS's pan stops at the end
 *   of the locked page and leaves the field under the keyboard; the keyboard inset lifts the
 *   dialog instead.
 * - A one-finger drag is cancelled unless something under it can scroll that way or takes the drag
 *   itself. With the keyboard up, iOS would otherwise pan the visual viewport over the page; with
 *   it down, the drag would only rubber-band the scroll-locked page.
 */
export function guardKeyboardTouch(element: HTMLElement): () => void {
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
      if (handlesOwnDrag(node) || canScrollToward(node, deltaX, deltaY)) {
        return;
      }
    }
    event.preventDefault();
  };
  const onTouchEnd = (event: TouchEvent) => {
    const target = event.target;
    if (!opensKeyboard(target) || target === document.activeElement || target.matches(':disabled')) {
      return;
    }
    event.preventDefault();
    target.focus({ preventScroll: true });
  };
  element.addEventListener('touchstart', onTouchStart, { passive: true });
  element.addEventListener('touchmove', onTouchMove, { passive: false });
  element.addEventListener('touchend', onTouchEnd);
  return () => {
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchmove', onTouchMove);
    element.removeEventListener('touchend', onTouchEnd);
  };
}
