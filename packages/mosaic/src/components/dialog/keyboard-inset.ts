/**
 * Publishes how much of the viewport an on-screen keyboard is covering, as `--_cl-keyboard-inset`.
 *
 * iOS does not resize the layout viewport when the keyboard opens — it shrinks the VISUAL viewport
 * and leaves layout alone. A `position: fixed` overlay therefore does not move, and a
 * bottom-anchored sheet ends up behind the keyboard entirely. `interactive-widget=resizes-content`
 * would make the browser handle it, but iOS Safari does not implement it and the viewport meta
 * belongs to the host app regardless. So the inset is measured here instead.
 *
 * Two places consume it:
 *
 * - The track pads its bottom edge by it, so a centered `card` re-centers in the space that is left
 *   and a `profile`, which stretches, shrinks into its own scroll region.
 * - A sheet stays flush to the bottom edge and pads its popup by it instead, so the sheet reaches
 *   down to the keyboard with no gap where iOS floats its address bar, which `visualViewport`
 *   counts as part of the keyboard.
 *
 * While the keyboard is up, iOS can also pan the visual viewport down to reveal a field, which
 * moves the top of the visible band below the top of the overlay. That pan is published as
 * `--_cl-keyboard-offset`, and the track pads its top edge by it, so the whole dialog stays inside
 * the band and scrolls within it rather than leaving its top out of reach above the screen.
 */

const PROPERTY = '--_cl-keyboard-inset';
const OFFSET_PROPERTY = '--_cl-keyboard-offset';

// Keyboard-sized changes only: browser toolbars collapsing and expanding stay below this.
const KEYBOARD_THRESHOLD = 60;

let listeners = 0;
let detach: (() => void) | null = null;
// A fixed `100svh` box. Chrome on iOS shrinks `svh` to the keyboard before it resizes the layout
// viewport to match, so a box that already fits the visible band means the browser is moving fixed
// content itself, and an inset would lift the dialog twice. Safari leaves `svh` alone.
let smallViewportProbe: HTMLElement | null = null;
let fixedBoxProbe: HTMLElement | null = null;

/**
 * The gap between the bottom of the layout viewport and the bottom of the visual viewport — which
 * is the keyboard, or any other interactive widget the browser has inset.
 *
 * `offsetTop` is part of it because iOS scrolls the visual viewport to bring a focused field into
 * view, so the visible band moves as well as shrinks.
 */
export function measureKeyboardInset(): number {
  const viewport = window.visualViewport;
  if (!viewport) {
    return 0;
  }
  // A pinch-zoomed page also shrinks the visual viewport, and padding the dialog for that would be
  // actively wrong — the user zoomed in to look at something, not because a keyboard appeared.
  if (viewport.scale > 1) {
    return 0;
  }
  if (smallViewportProbe && smallViewportProbe.offsetHeight - viewport.height <= KEYBOARD_THRESHOLD) {
    return 0;
  }
  const layoutHeight = fixedBoxProbe?.offsetHeight ?? document.documentElement.clientHeight;
  return Math.max(0, Math.round(layoutHeight - (viewport.height + viewport.offsetTop)));
}

function publish(): void {
  const inset = measureKeyboardInset();
  const offset = inset > 0 ? Math.round(Math.max(0, window.visualViewport?.offsetTop ?? 0)) : 0;
  document.documentElement.style.setProperty(PROPERTY, `${inset}px`);
  document.documentElement.style.setProperty(OFFSET_PROPERTY, `${offset}px`);
}

/**
 * Starts publishing the inset, refcounted so stacked dialogs share one set of listeners and the
 * last one to close tears them down. Returns a no-op where `visualViewport` is unavailable, which
 * covers SSR and any browser without it — the CSS falls back to `0px` and nothing moves.
 */
export function acquireKeyboardInset(): () => void {
  if (typeof window === 'undefined' || !window.visualViewport) {
    return () => {};
  }

  listeners++;
  if (listeners === 1) {
    const viewport = window.visualViewport;
    smallViewportProbe = document.createElement('div');
    smallViewportProbe.style.cssText =
      'position:fixed;top:0;height:100svh;width:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(smallViewportProbe);
    fixedBoxProbe = document.createElement('div');
    fixedBoxProbe.style.cssText = 'position:fixed;top:0;bottom:0;width:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(fixedBoxProbe);
    publish();
    viewport.addEventListener('resize', publish);
    viewport.addEventListener('scroll', publish);
    detach = () => {
      viewport.removeEventListener('resize', publish);
      viewport.removeEventListener('scroll', publish);
      smallViewportProbe?.remove();
      smallViewportProbe = null;
      fixedBoxProbe?.remove();
      fixedBoxProbe = null;
      document.documentElement.style.removeProperty(PROPERTY);
      document.documentElement.style.removeProperty(OFFSET_PROPERTY);
    };
  }

  return () => {
    listeners--;
    if (listeners === 0 && detach) {
      detach();
      detach = null;
    }
  };
}
