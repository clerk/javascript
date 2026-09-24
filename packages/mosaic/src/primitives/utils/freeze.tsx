'use client';

import * as React from 'react';

/**
 * Never settles. Throwing it suspends the enclosing boundary indefinitely: React keeps
 * rendering the subtree but holds the commit, so the DOM keeps painting its last frame.
 */
const never = new Promise<never>(() => {});

function Suspend(): null {
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- Suspending is React's thrown-thenable protocol, not an error. `React.use()` would say this more plainly but needs React 19.2; this package supports React 18.
  throw never;
}

export interface FreezeProps {
  /** While `true`, the DOM below holds whatever it last committed. */
  frozen: boolean;
  children?: React.ReactNode;
}

/**
 * Holds its subtree's DOM at the last committed frame while `frozen`. Renders keep
 * happening, they just don't reach the DOM; the pending one commits when `frozen` flips
 * back to `false`.
 *
 * Use it to stop content from visibly changing under an exit animation — a popover that
 * closes because the thing it was showing changed would otherwise swap its contents on the
 * way out.
 */
export function Freeze({ frozen, children }: FreezeProps) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Hold onto the node ourselves rather than reading a plain ref: hiding a boundary's children
  // detaches their refs, so by the time the effect below runs a normal ref reads `null`.
  const setContent = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      contentRef.current = node;
    }
  }, []);

  // React hides a suspended boundary's host children with `display: none !important`, which is
  // the opposite of what this is for. Undo it on the commit that applies it: insertion effects
  // run after the boundary's mutation and before paint, so the held frame never blinks out.
  // `display: contents` is also what the wrapper renders with, so React puts it back on unfreeze
  // and the wrapper stays out of the layout it is spliced into.
  React.useInsertionEffect(() => {
    if (frozen) {
      contentRef.current?.style.setProperty('display', 'contents');
    }
  }, [frozen]);

  return (
    <React.Suspense fallback={null}>
      {frozen ? <Suspend /> : null}
      <div
        ref={setContent}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
    </React.Suspense>
  );
}
