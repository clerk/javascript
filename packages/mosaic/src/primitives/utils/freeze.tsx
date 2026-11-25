'use client';

import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as React from 'react';

interface Flag {
  subscribe: (listener: () => void) => () => void;
  read: () => boolean;
  request: () => void;
  ack: () => void;
  release: () => void;
}

/*
  The <Freeze> component freezes the last frame seen before frozen flipped true, this
  is useful to preserve the DOM while exit animations are running.

  All of this is very hacky and I'd rather not rely on it, but the fact is we've built
  ourselves into a corner relying on this so this is a best effort attempt to make it
  work for transitions. I don't recommend anyone copying this.

  The React solution for this is ViewTransitions, which shipped in 19.3, but we can't
  rely on that yet.

  ---

  React has different lanes, sync for immediate updates and async used for concurrent
  work/transitions, and the Freeze needs to work for both.

  Suspense acts differently depending on which lane it happens in. In the sync
  lane, the fallback is shown immediately, but for the async one the content
  is kept on screen. A boundary that is already in a fallback state does not block
  neither sync nor async lanes.

  The original Freeze version we had (which is commonly shared on the internet),
  would suspend forever, the async lane would never commit and it would hang forever.

  This createFlag store is the key for working around that by facilitating communication
  between the sync lane and the async one.

  - `current`  is the value `read()` returns and `useSyncExternalStore` hands back as `held`.
  - `pending`  is true while a notify queued by `request` has not fired yet.

  How it works:

  - In render, for both sync and async lanes, request() gets called
    - This is a side effect in render, but it's at least idempotent
  - The current/held value is updated immediately, so the same render will suspend
  - In the sync lane
    - The insertion effect acks() the request and notify never fires
    - The suspend triggers the fallback immediately and everything proceeds
  - In the async lane
    - The suspend triggers, the old content is kept on screen and the lane won't commit
      until the promise resolves, this was the original bug
    - Listeners are notified in a microtask so it doesn't happen in
      render, but still inside the same JS frame
    - The notify triggers an immediate sync lane update via uSES, this suspends,
      which in the sync lane means showing the fallback immediately
    - The async lane restarts, this time the fallback is already showing
      and things proceed without blocking the lane

  See the comments further down at the effects to see how the release works.
*/
function createFlag(initial: boolean): Flag {
  let current = initial;
  let pending = false;
  const listeners = new Set<() => void>();

  function notify(): void {
    listeners.forEach(listener => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function read(): boolean {
    return current;
  }

  function request(): void {
    if (current) {
      return;
    }
    current = true;
    if (pending) {
      return;
    }
    pending = true;
    queueMicrotask(() => {
      if (!pending) {
        return;
      }
      pending = false;
      notify();
    });
  }

  function ack(): void {
    pending = false;
  }

  function release(): void {
    if (!current) {
      return;
    }
    current = false;
    notify();
  }

  return { subscribe, read, request, ack, release };
}

function Suspend({ promise }: { promise: Promise<never> }): null {
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- Suspending is React's thrown-thenable protocol, not an error. `React.use()` would say this more plainly but needs React 19.2; this package supports React 18.
  throw promise;
}

export interface FreezeProps {
  /** While true, the DOM below holds the frame last committed before it became true */
  frozen: boolean;
  children?: React.ReactNode;
}

export function Freeze({ frozen, children }: FreezeProps) {
  const [flag] = React.useState(() => createFlag(frozen));
  // One promise per instance: React attaches a retry listener to every promise a
  // boundary throws, and the listener holds that boundary's fiber and DOM. A shared
  // promise never settles, so it would keep every Freeze that ever froze alive after
  // it unmounted. A per-instance promise is collected with the instance.
  const [never] = React.useState(() => new Promise<never>(() => {}));

  if (frozen) {
    flag.request();
  }

  const held = React.useSyncExternalStore(flag.subscribe, flag.read, flag.read);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const startedRef = React.useRef(false);

  // This has to be a callback ref. Hiding a boundary detaches the refs below it,
  // so a plain ref reads null by the time the insertion effect runs
  const setContent = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      contentRef.current = node;
    }
  }, []);

  // This needs to happen before other components run their layout effects, especially
  // the un-hiding of the content as layout effects might depend on that
  React.useInsertionEffect(() => {
    if (held) {
      // If this effect is running we are already committing so there is no need to notify,
      // as this would only trigger and waste a new render we don't need
      flag.ack();
      // This is the Freeze hack, unhide the content React hid to show the fallback instead
      contentRef.current?.style.setProperty('display', 'contents');
      // The layout effect needs to know if we are inside the commit that started the hold
      startedRef.current = true;
    }
  }, [held]);

  // This is triggering an update on release, which insertion effects are not allowed to do,
  // but we still want it in a layout effect and not an effect, a plain effect might happen
  // after paint has already happened
  useSafeLayoutEffect(() => {
    const started = startedRef.current;
    startedRef.current = false;

    /*
      If the held was set from an async lane, frozen was also set to true inside
      that async lane, so back in the sync lane it's still false. This would release
      in the same commit as we froze, so we use the started guard to say
      "don't release in the same commit as we held, even if frozen is false".

      The tradeoff of that is that if another sync update happens while the transition
      is pending, started is now false and frozen is still false, so we release too early.
      Sync updates always restart the transition, which again requests a hold and we'll
      be back where we started, just with a few wasted cycles.

      Two tempting fixes for the early release both break abandonment, which is a
      transition that requests a hold and is then aborted: frozen flips false -> true
      -> false, but only the two false ever commit, so no commit ever carries true.

      1. Keeping started true until a commit with frozen true has happened. That commit
         never comes, so every later commit skips the release and the hold is stuck.
      2. Giving this effect a dependency array of held and frozen. Both are the same in
         the second false commit as in the hold's own commit, so the effect never runs
         again and the hold is stuck.

      So the effect runs on every commit and the rule stays blunt: a committed frozen
      false releases, unless this is the commit that started the hold.
    */
    const shouldRelease = !frozen && !started;
    if (held && shouldRelease) {
      // The release happens synchronously (which is fine as this is not inside render),
      // so before anything has a chance to painth, React will re-render as unfrozen
      flag.release();
    }
  });

  return (
    <React.Suspense fallback={null}>
      {held ? <Suspend promise={never} /> : null}
      <div
        ref={setContent}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
    </React.Suspense>
  );
}
