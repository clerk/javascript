import type { Middleware } from '@floating-ui/react';
import type { RefObject } from 'react';

const VIEWPORT_PADDING = 8;
const MIN_HEIGHT = 100;
const TRIGGER_EDGE_THRESHOLD = 20;

export interface AlignSelectedItemOptions {
  selectedItemRef: RefObject<HTMLElement | null>;
  openRef: RefObject<boolean>;
  /** Called when the trigger sits where an aligned popup would be unusable; position it like a menu instead. */
  onFallback: () => void;
  /** Called when the list scroll has moved the popup and floating-ui must reapply the position. */
  requestUpdate: () => void;
}

interface Alignment {
  dy: number;
  availableHeight: number;
  viewportHeight: number;
  /** Free space between the popup's edges and the viewport padding, consumed as the list scrolls. */
  freeAbove: number;
  freeBelow: number;
}

// Layout offset, immune to the popup's enter/exit scale transform.
function offsetWithin(child: HTMLElement, ancestor: HTMLElement): number {
  let top = 0;
  let el: HTMLElement | null = child;
  while (el && el !== ancestor) {
    top += el.offsetTop;
    el = el.offsetParent instanceof HTMLElement ? el.offsetParent : null;
  }
  for (let scroller = child.parentElement; scroller && scroller !== ancestor; scroller = scroller.parentElement) {
    top -= scroller.scrollTop;
  }
  return top;
}

function findScrollParent(from: HTMLElement, until: HTMLElement): HTMLElement | null {
  for (let el = from.parentElement; el && el !== until; el = el.parentElement) {
    if (el.scrollHeight > el.clientHeight) {
      return el;
    }
  }
  return null;
}

function setHeight(floating: HTMLElement, height: number | null) {
  floating.style.maxHeight = height === null ? '' : `${height}px`;
  floating.style.setProperty('--cl-available-height', height === null ? '' : `${height}px`);
}

/**
 * Positions the popup so the selected option sits over the trigger, like a native `<select>`.
 *
 * Where the viewport cuts the popup off, the list is shortened and scrolled so the option still
 * lands on the trigger. Scrolling the list toward the cut-off rows then grows the popup into the
 * free space on the other side before the list scrolls in place. Measured once per open and then
 * held relative to the trigger, so page scrolling and the exit transition never move the popup.
 */
export function alignSelectedItem({
  selectedItemRef,
  openRef,
  onFallback,
  requestUpdate,
}: AlignSelectedItemOptions): Middleware {
  let held: Alignment | null = null;
  let measuredThisOpen = false;
  let measuredFloating: HTMLElement | null = null;
  let detachScroll: (() => void) | null = null;

  function watchScroll(scroller: HTMLElement, floating: HTMLElement) {
    detachScroll?.();
    let lastScrollTop = scroller.scrollTop;
    const onScroll = () => {
      const delta = scroller.scrollTop - lastScrollTop;
      lastScrollTop = scroller.scrollTop;
      if (!held || !openRef.current || delta === 0) {
        return;
      }
      if (delta < 0 && held.freeBelow > 0) {
        // Rows slid down; extend the bottom edge so none fall off it.
        const grow = Math.min(-delta, held.freeBelow);
        held.freeBelow -= grow;
        held.availableHeight += grow;
        setHeight(floating, held.availableHeight);
      } else if (delta > 0 && held.freeAbove > 0) {
        // Move the popup up instead of the rows, so the visible rows slide up without any leaving.
        const grow = Math.min(delta, held.freeAbove);
        held.freeAbove -= grow;
        held.availableHeight += grow;
        held.dy -= grow;
        setHeight(floating, held.availableHeight);
        scroller.scrollTop -= grow;
        lastScrollTop = scroller.scrollTop;
        requestUpdate();
      }
    };
    scroller.addEventListener('scroll', onScroll);
    detachScroll = () => scroller.removeEventListener('scroll', onScroll);
  }

  return {
    name: 'alignSelectedItem',
    fn({ rects, elements }) {
      // A close is not guaranteed to reposition, so a remounted popup also marks a fresh open;
      // a resized viewport needs the cut and scroll redone.
      if (
        !openRef.current ||
        elements.floating !== measuredFloating ||
        (held && held.viewportHeight !== window.innerHeight)
      ) {
        measuredThisOpen = false;
      }
      if (held && (!openRef.current || measuredThisOpen)) {
        return {
          x: rects.reference.x,
          y: rects.reference.y + held.dy,
          data: { availableHeight: held.availableHeight },
        };
      }

      const floating = elements.floating;
      const viewportHeight = window.innerHeight;
      const viewportTop = VIEWPORT_PADDING;
      const viewportBottom = viewportHeight - VIEWPORT_PADDING;
      const maxHeight = viewportBottom - viewportTop;
      detachScroll?.();
      detachScroll = null;

      const selected = selectedItemRef.current;
      if (!selected || !openRef.current) {
        held = null;
        setHeight(floating, maxHeight);
        return { data: { availableHeight: maxHeight } };
      }

      // Measured uncapped: the cut below needs the list's natural height, not a previous cap.
      setHeight(floating, null);
      const referenceRect = elements.reference.getBoundingClientRect();
      const floatingHeight = floating.getBoundingClientRect().height;
      setHeight(floating, maxHeight);
      const desiredTop = referenceRect.top - offsetWithin(selected, floating);
      const desiredBottom = desiredTop + floatingHeight;
      const top = Math.max(desiredTop, viewportTop);
      const bottom = Math.min(desiredBottom, viewportBottom);

      const triggerNearEdge =
        referenceRect.top < TRIGGER_EDGE_THRESHOLD || referenceRect.bottom > viewportHeight - TRIGGER_EDGE_THRESHOLD;
      if (triggerNearEdge || bottom - top < Math.min(floatingHeight, MIN_HEIGHT)) {
        held = null;
        onFallback();
        return {};
      }

      const cut = bottom - top < floatingHeight;
      const availableHeight = cut ? bottom - top : maxHeight;
      if (cut) {
        setHeight(floating, availableHeight);
      }
      const scroller = findScrollParent(selected, floating);
      const scrollBy = top - desiredTop;
      if (scroller && scrollBy !== 0) {
        scroller.scrollTop = Math.max(0, scroller.scrollTop + scrollBy);
      }
      if (scroller) {
        watchScroll(scroller, floating);
      }

      // `rects` live in the floating element's coordinate space; DOM rects are viewport-relative.
      held = {
        dy: top - referenceRect.top,
        availableHeight,
        viewportHeight,
        freeAbove: top - viewportTop,
        freeBelow: viewportBottom - bottom,
      };
      measuredThisOpen = true;
      measuredFloating = floating;
      return { x: rects.reference.x, y: rects.reference.y + held.dy, data: { availableHeight } };
    },
  };
}
