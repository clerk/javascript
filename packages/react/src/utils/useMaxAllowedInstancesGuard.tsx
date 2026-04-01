import React from 'react';

import { errorThrower } from '../errors/errorThrower';

const counts = new Map<string, number>();

export function useMaxAllowedInstancesGuard(name: string, error: string, maxCount = 1): void {
  React.useEffect(() => {
    const count = counts.get(name) || 0;
    if (count == maxCount) {
      return errorThrower.throw(error);
    }
    counts.set(name, count + 1);

    return () => {
      counts.set(name, (counts.get(name) || 1) - 1);
    };
  }, []);
}

export function withMaxAllowedInstancesGuard<P>(
  WrappedComponent: P,
  name: string,
  error: string,
): P & { displayName: string } {
  // @ts-expect-error - simplified types to preserve generics in P
  const displayName = WrappedComponent.displayName || WrappedComponent.name || name || 'Component';
  const Hoc = (props: P) => {
    useMaxAllowedInstancesGuard(name, error);
    // @ts-expect-error - simplified types to preserve generics in P
    return <WrappedComponent {...(props as any)} />;
  };
  Hoc.displayName = `withMaxAllowedInstancesGuard(${displayName})`;
  // @ts-expect-error - simplified types to preserve generics in P
  return Hoc;
}
