import type { Component } from 'solid-js';
import { onCleanup, onMount } from 'solid-js';

const counts = new Map<string, number>();

export function useMaxAllowedInstancesGuard(name: string, error: string, maxCount = 1): void {
  onMount(() => {
    const count = counts.get(name) || 0;
    if (count == maxCount) {
      throw new Error(error);
    }
    counts.set(name, count + 1);

    onCleanup(() => {
      counts.set(name, (counts.get(name) || 1) - 1);
    });
  });
}

export function withMaxAllowedInstancesGuard<P>(WrappedComponent: Component<P>, name: string, error: string) {
  // @ts-expect-error hack
  const displayName = WrappedComponent.displayName || WrappedComponent.name || name || 'Component';
  const Hoc = (props: P) => {
    useMaxAllowedInstancesGuard(name, error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <WrappedComponent {...(props as any)} />;
  };
  Hoc.displayName = `withMaxAllowedInstancesGuard(${displayName})`;
  return Hoc;
}
