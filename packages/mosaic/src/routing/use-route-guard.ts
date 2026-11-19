import { useEffect } from 'react';

import type { WriteOptions } from './location';

interface GuardedScope<Name extends string> {
  route: Name | undefined;
  go: (name: Name, params: undefined, options: WriteOptions) => void;
}

export function useRouteGuard<Name extends string>({ route, go }: GuardedScope<Name>, allowed: Name | undefined): void {
  useEffect(() => {
    if (allowed !== undefined && allowed !== route) {
      go(allowed, undefined, { replace: true });
    }
  }, [allowed, route, go]);
}
