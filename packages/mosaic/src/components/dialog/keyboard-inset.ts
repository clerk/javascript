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
 * - A sheet stays flush to the bottom edge and pads its popup by it instead, so its surface runs on
 *   under Safari's floating address bar, which `visualViewport` counts as part of the keyboard.
 */

import type React from 'react';

import { opensKeyboard } from '../../primitives/utils';

const PROPERTY = '--_cl-keyboard-inset';

let listeners = 0;
let detach: (() => void) | null = null;

/**
 * The gap between the bottom of the layout viewport and the bottom of the visual viewport — which
 * is the keyboard, or any other interactive widget the browser has inset.
 *
 * `offsetTop` is part of it because iOS scrolls the visual viewport to bring a focused field into
 * view, so the visible band moves as well as shrinks.
 */
function measure(): number {
  const viewport = window.visualViewport;
  if (!viewport) {
    return 0;
  }
  // A pinch-zoomed page also shrinks the visual viewport, and padding the dialog for that would be
  // actively wrong — the user zoomed in to look at something, not because a keyboard appeared.
  if (viewport.scale > 1) {
    return 0;
  }
  return Math.max(0, Math.round(document.documentElement.clientHeight - (viewport.height + viewport.offsetTop)));
}

function publish(): void {
  document.documentElement.style.setProperty(PROPERTY, `${measure()}px`);
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
    publish();
    viewport.addEventListener('resize', publish);
    viewport.addEventListener('scroll', publish);
    detach = () => {
      viewport.removeEventListener('resize', publish);
      viewport.removeEventListener('scroll', publish);
      document.documentElement.style.removeProperty(PROPERTY);
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

// iOS's reveal pan stops at the end of the locked page, leaving the canvas under the keyboard; the inset lifts the dialog instead.
export function focusWithoutScroll(event: React.TouchEvent): void {
  const target = event.target;
  if (!opensKeyboard(target) || target === document.activeElement || target.matches(':disabled')) {
    return;
  }
  event.preventDefault();
  target.focus({ preventScroll: true });
}
