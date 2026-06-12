import { type ReactNode, Suspense, useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * A Suspense boundary that only activates on the client.
 *
 * On the server (and the first client render, for hydration parity) it renders `fallback`
 * directly — it does **not** mount `children`, so nothing suspends server-side. That matters for
 * client-only data: a real `<Suspense>` whose promise can only resolve in the browser would keep
 * the SSR stream open forever (perpetual tab loading) or re-suspend in a loop. Once mounted, it
 * upgrades to a normal `<Suspense>` and the children load + suspend as usual.
 */
export function ClientSuspense({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true, // client
    () => false, // server + first hydration pass
  );

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
}
