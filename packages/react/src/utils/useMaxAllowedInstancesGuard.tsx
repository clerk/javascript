import React from 'react';

const counts = new Map<string, number>();

export function useMaxAllowedInstancesGuard(name: string, error: string, maxCount = 1): void {
  React.useEffect(() => {
    const count = counts.get(name) || 0;
    if (count == maxCount) {
      throw new Error(error);
    }
    counts.set(name, count + 1);

    return () => {
      counts.set(name, (counts.get(name) || 1) - 1);
    };
  }, []);
}

export function withMaxAllowedInstancesGuard<P>(
  WrappedComponent: React.ComponentType<P>,
  name: string,
  error: string,
): React.ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || name || 'Component';
  const Hoc = (props: P) => {
    useMaxAllowedInstancesGuard(name, error);
    return <WrappedComponent {...props} />;
  };
  Hoc.displayName = `withMaxAllowedInstancesGuard(${displayName})`;
  return Hoc;
}
