'use client';

import { type RefObject, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

/**
 * Returns a function that waits for all CSS animations/transitions on the
 * referenced element to finish, then invokes a callback.
 *
 * Uses the Web Animations API (`element.getAnimations()` + `animation.finished`)
 * so we're duration-agnostic — CSS owns all timing.
 *
 * When `open` is true, waits for `[data-cl-starting-style]` to be removed
 * before polling animations. This avoids a race where `getAnimations()` returns
 * an empty array before the enter transition has been registered.
 *
 * Each call aborts any pending wait from a previous call, so rapid open/close
 * toggles don't leak stale callbacks.
 */
export function useAnimationsFinished(ref: RefObject<HTMLElement | null>, open: boolean) {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return useCallback(
    (callback: () => void) => {
      const element = ref.current;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const { signal } = controller;

      if (!element || typeof element.getAnimations !== 'function') {
        callback();
        return;
      }

      const runCheck = () => {
        if (signal.aborted) return;
        const animations = element.getAnimations();
        if (animations.length === 0) {
          // Called synchronously (from useEffect or MutationObserver) —
          // plain callback is fine, React will batch the state update.
          callback();
          return;
        }
        Promise.all(animations.map(a => a.finished))
          .then(() => {
            if (signal.aborted) return;
            // Called from a microtask — flushSync forces synchronous unmount
            // so there's no flash of the element in its final animated state.
            flushSync(callback);
          })
          .catch(() => {
            if (signal.aborted) return;
            // An animation was cancelled. If new animations are running, wait
            // for those instead; otherwise we're done.
            const current = element.getAnimations();
            if (current.length > 0) {
              runCheck();
            } else {
              flushSync(callback);
            }
          });
      };

      if (open && element.hasAttribute('data-cl-starting-style')) {
        const observer = new MutationObserver(() => {
          if (!element.hasAttribute('data-cl-starting-style')) {
            observer.disconnect();
            runCheck();
          }
        });
        observer.observe(element, {
          attributes: true,
          attributeFilter: ['data-cl-starting-style'],
        });
        signal.addEventListener('abort', () => observer.disconnect());
        return;
      }

      runCheck();
    },
    [ref, open],
  );
}
