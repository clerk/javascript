'use client';

import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';

import {
  CLOSE_THRESHOLD,
  MIN_SAMPLE_MS,
  OPEN_GRACE_PERIOD,
  RELEASE_VEL_MAX_AGE_MS,
  SCROLL_LOCK_TIMEOUT,
  VELOCITY_THRESHOLD,
} from './constants';
import { DrawerAttrs, DrawerCssVars } from './css-vars';
import { clamp, dampen, isIOS, safeCapture } from './helpers';
import type { SnapController } from './use-snap-points';

export interface UseDrawerDragOptions {
  popupRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  /** When true (default), a downward release past threshold closes the drawer. */
  dismissible: boolean;
  /** When true, only a press starting on `[data-drawer-handle]` drags. */
  handleOnly: boolean;
  snapPoints?: number[];
  snap: SnapController | null;
  /** Closes the drawer (exit is owned by `useTransition` + the styled ending-style). */
  close: () => void;
  /** Injectable clock so velocity is deterministic under test. */
  now: () => number;
  setVar: (name: string, value: string) => void;
  /** The single writer of the live swipe-y (keeps the CSS var and `curSwipe` in lockstep). */
  setSwipe: (px: number) => void;
  /** Source of truth for the current swipe-y, read by drag decisions. */
  curSwipe: React.MutableRefObject<number>;
  /** When this drawer is nested, report its live 0..1 dismiss progress so the parent can scale in. */
  onNestedDrag?: (progress: number) => void;
  /** When this drawer is nested, signal the parent that the drag ended (and whether this drawer stays open). */
  onNestedRelease?: (childOpen: boolean) => void;
}

export interface UseDrawerDragReturn {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  isDragging: boolean;
}

function scrolls(el: HTMLElement): boolean {
  const { overflowY } = getComputedStyle(el);
  return overflowY === 'auto' || overflowY === 'scroll';
}

/**
 * Pointer/transform drag engine for a bottom sheet (Y axis only). Down-to-dismiss
 * with velocity and distance thresholds, an inner-scroll-aware gate, and snap-point
 * delegation. All per-gesture state lives in refs; only `isDragging` is React state.
 *
 * Movement is written via the `swipeY` CSS var (no direct `transform`), so the
 * `curSwipe` ref — not `getComputedStyle` — is the source of truth for decisions.
 */

export function useDrawerDrag(opts: UseDrawerDragOptions): UseDrawerDragReturn {
  const { open, now } = opts;
  const [isDragging, setIsDragging] = useState(false);

  // Per-gesture state. Only `isDragging` (above) drives rendering.
  const pid = useRef<number | null>(null);
  const startY = useRef(0);
  const allowed = useRef(false); // committed to dragging the sheet this gesture
  const draggingRef = useRef(false); // synchronous mirror of isDragging for the handler guards
  const lastScrollAt = useRef(0);
  const sheetH = useRef(0);
  const openTime = useRef(0);
  const lastSample = useRef({ y: 0, t: 0 });
  const vel = useRef(0); // px/ms, signed
  const captured = useRef<Element | null>(null);
  // Removes the current iOS `touchend` fallback listener (see `onPointerDown`),
  // so it never outlives its gesture or piles up across gestures.
  const removeTouchEnd = useRef<(() => void) | null>(null);
  // Removes the window-level release listeners armed for the current gesture (see `onPointerDown`).
  const removeWindowRelease = useRef<(() => void) | null>(null);

  // Latest options, read at event time so the handlers can stay referentially stable.
  const cfg = useRef(opts);
  cfg.current = opts;

  // Record when the drawer opened so the grace window can suppress drag while the
  // enter animation settles.
  useEffect(() => {
    if (open) {
      openTime.current = now();
    }
  }, [open, now]);

  // Drop any pending iOS touchend fallback if the drawer unmounts mid-gesture.
  useEffect(
    () => () => {
      removeTouchEnd.current?.();
      removeWindowRelease.current?.();
    },
    [],
  );

  // A gesture never outlives the open state. Should a release be lost anyway, closing (or the
  // sheet unmounting under the finger) must not leave the engine armed for the next open.
  useEffect(() => {
    if (open) {
      return;
    }
    draggingRef.current = false;
    allowed.current = false;
    pid.current = null;
    removeWindowRelease.current?.();
    removeWindowRelease.current = null;
    // A dismiss leaves the swipe where the finger let go, on purpose — the exit slides from there.
    // The next open starts at rest, and `shouldDrag` reads this ref before it looks at inner
    // scroll, so a stale value would drag the sheet where a list should have scrolled.
    cfg.current.setSwipe(0);
    cfg.current.setVar(DrawerCssVars.swipeProgress, '0');
    setIsDragging(false);
  }, [open]);

  const shouldDrag = useCallback((target: HTMLElement, down: boolean): boolean => {
    const { now: clock, curSwipe, snap } = cfg.current;
    // Total displacement from fully-open = resting snap offset + live drag delta.
    // Summed from our own authored values, never parsed from getComputedStyle.
    const swipe = curSwipe.current + (snap?.restOffset ?? 0);

    if (target.tagName === 'SELECT') {
      return false;
    }
    // Native range inputs and custom slider thumbs consume the drag themselves.
    if (target.closest('input[type="range"], [role="slider"]')) {
      return false;
    }
    if (target.closest(`[${DrawerAttrs.noDrag}]`)) {
      return false;
    }
    // A text selection is in progress INSIDE the sheet (contenteditable / regular DOM text). One
    // elsewhere on the page is none of the sheet's business, and would otherwise veto every drag
    // for as long as it stood.
    const selection = window.getSelection();
    const sheet = cfg.current.popupRef.current;
    if (
      selection &&
      !selection.isCollapsed &&
      selection.toString().length &&
      selection.anchorNode &&
      sheet?.contains(selection.anchorNode)
    ) {
      return false;
    }
    // A focused input/textarea with a non-collapsed selection: dragging is
    // adjusting a selection handle, not the sheet. (input/textarea selections
    // are not reflected in `window.getSelection()`.)
    const active = document.activeElement;
    if (
      (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) &&
      active.selectionStart !== active.selectionEnd
    ) {
      return false;
    }
    if (clock() - openTime.current < OPEN_GRACE_PERIOD) {
      return false;
    }
    // Already dragged down this gesture — keep going.
    if (swipe > 0) {
      return true;
    }
    // Suppress drag briefly after inner content was scrolled.
    if (lastScrollAt.current && clock() - lastScrollAt.current < SCROLL_LOCK_TIMEOUT && swipe === 0) {
      lastScrollAt.current = clock();
      return false;
    }
    // Inner content with room to scroll the way the content would move takes the gesture: down,
    // it has scrolled (the finger pulls it back); up, there is more below. Otherwise the sheet
    // moves — rubber-banding upward at rest, so the drag is never simply swallowed. The walk ends
    // at the sheet: nothing above it is inner content, and its box may well be taller than the
    // screen, while the page behind must never veto a drag.
    for (let el: HTMLElement | null = target; el; el = el.parentElement) {
      // Only a box that can scroll is inner content: a clipped or overflowing one has the same
      // geometry and none of the behaviour, and would swallow every upward drag at rest.
      if (el.scrollHeight > el.clientHeight && scrolls(el)) {
        const room = down ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1;
        if (room) {
          if (down) {
            lastScrollAt.current = clock();
          }
          return false;
        }
      }
      if (el === sheet) {
        break;
      }
    }
    return true;
  }, []);

  const sample = useCallback((y: number, t: number): void => {
    const dt = Math.max(t - lastSample.current.t, MIN_SAMPLE_MS);
    vel.current = (y - lastSample.current.y) / dt;
    lastSample.current = { y, t };
  }, []);

  const onRelease = useCallback((e: { clientY: number }): void => {
    if (!draggingRef.current) {
      return;
    }
    // Normal release: neither fallback is needed any more.
    removeTouchEnd.current?.();
    removeTouchEnd.current = null;
    removeWindowRelease.current?.();
    removeWindowRelease.current = null;
    const {
      snapPoints,
      snap,
      dismissible,
      close,
      setVar,
      setSwipe,
      now: clock,
      curSwipe,
      onNestedRelease,
    } = cfg.current;

    if (captured.current && pid.current !== null) {
      safeCapture(captured.current, pid.current, 'releasePointerCapture');
    }
    captured.current = null;
    setIsDragging(false);
    draggingRef.current = false;
    const didDrag = allowed.current;
    allowed.current = false;
    pid.current = null;

    // Never committed to dragging the sheet (e.g. scrolled inner content). Do not
    // close — releasing a fast inner-scroll must not be read as a flick-to-dismiss.
    if (!didDrag) {
      return;
    }

    const reset = (): void => {
      setSwipe(0);
      setVar(DrawerCssVars.swipeProgress, '0');
    };

    const swipe = curSwipe.current;
    // Signed (positive is downward). Keeping the sign means a fast *upward* flick
    // that ends net-downward isn't mistaken for a downward dismiss.
    const v = clock() - lastSample.current.t <= RELEASE_VEL_MAX_AGE_MS ? vel.current : 0;
    // Faster flick => shorter exit; the styled layer reads this to scale duration.
    setVar(DrawerCssVars.swipeStrength, String(clamp(1 - Math.abs(v), 0.1, 1)));

    if (snapPoints && snap) {
      const childOpen = snap.onRelease({ dist: e.clientY - startY.current, v, dismissible, close });
      onNestedRelease?.(childOpen);
      return;
    }

    // Dismiss only on a net-downward release that is either a flick or past the
    // distance threshold; otherwise snap back. A nesting parent is told which way
    // this went so it can settle its scale in one direction (no flicker).
    const dismiss =
      e.clientY >= startY.current && (v > VELOCITY_THRESHOLD || swipe >= sheetH.current * CLOSE_THRESHOLD);
    if (dismiss) {
      close();
    } else {
      reset();
    }
    onNestedRelease?.(!dismiss);
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>): void => {
      const { popupRef, dismissible, handleOnly, snapPoints, now: clock } = cfg.current;
      if (e.pointerType === 'mouse' && e.button !== 0) {
        return;
      }
      if (!dismissible && !snapPoints) {
        return; // nothing a drag could accomplish
      }
      const popup = popupRef.current;
      if (!popup || !popup.contains(e.target as Node)) {
        return;
      }
      if (handleOnly && !(e.target as HTMLElement).closest(`[${DrawerAttrs.handle}]`)) {
        return;
      }

      sheetH.current = popup.getBoundingClientRect().height;
      pid.current = e.pointerId;
      startY.current = e.clientY;
      const t = clock();
      lastSample.current = { y: e.clientY, t };
      vel.current = 0;
      allowed.current = false;
      draggingRef.current = true;
      // Not `setIsDragging` yet: a press is not a drag. `data-swiping` — and everything the styled
      // layer hangs off it — lands on the first move that commits to dragging the sheet.

      // Capture the actual target (not the popup) so a click on an inner control
      // still lands on it; the popup handler keeps receiving bubbled moves. (vaul)
      const target = e.target as Element;
      captured.current = target;
      safeCapture(target, e.pointerId, 'setPointerCapture');

      // The release is expected on the captured target, but capture is not a guarantee — a release
      // the popup never sees would leave the sheet held mid-drag, across opens. Whatever lands on
      // `window` for this pointer ends the gesture; the popup's own handler then finds nothing to do.
      removeWindowRelease.current?.();
      const pointerId = e.pointerId;
      const onWindowRelease = (ev: PointerEvent): void => {
        if (ev.pointerId === pointerId) {
          onRelease(ev);
        }
      };
      window.addEventListener('pointerup', onWindowRelease, true);
      window.addEventListener('pointercancel', onWindowRelease, true);
      removeWindowRelease.current = () => {
        window.removeEventListener('pointerup', onWindowRelease, true);
        window.removeEventListener('pointercancel', onWindowRelease, true);
      };

      // iOS doesn't dispatch pointerup after a scroll-cancelled gesture, so reset
      // `allowed` on touchend. Track the listener (and drop any stale one from a
      // prior gesture that never fired) so it's removed on release/unmount instead
      // of leaking on `window`.
      if (isIOS()) {
        removeTouchEnd.current?.();
        const onTouchEnd = (): void => {
          allowed.current = false;
          removeTouchEnd.current = null;
        };
        window.addEventListener('touchend', onTouchEnd, { once: true });
        removeTouchEnd.current = () => window.removeEventListener('touchend', onTouchEnd);
      }
    },
    [onRelease],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>): void => {
      if (!draggingRef.current || e.pointerId !== pid.current) {
        return;
      }
      const { snapPoints, snap, setSwipe, setVar, now: clock, onNestedDrag } = cfg.current;
      const dist = e.clientY - startY.current; // positive is downward
      const down = dist > 0;

      if (!allowed.current && !shouldDrag(e.target as HTMLElement, down)) {
        return;
      }
      if (!allowed.current) {
        setIsDragging(true);
      }
      allowed.current = true;
      sample(e.clientY, clock());

      // Nested: hand the parent our normalized downward progress so it can scale in.
      onNestedDrag?.(clamp(dist / sheetH.current, 0, 1));

      if (snapPoints && snap) {
        snap.onDrag(dist);
        return;
      }
      if (!down) {
        // Rubber-band over-drag past the open position; never moves below rest.
        setSwipe(Math.min(-dampen(-dist), 0));
        return;
      }
      setSwipe(dist);
      setVar(DrawerCssVars.swipeProgress, String(Math.min(dist / sheetH.current, 1)));
    },
    [shouldDrag, sample],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onRelease,
    onPointerCancel: onRelease,
    isDragging,
  };
}
