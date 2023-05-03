'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';

type Resolve = (value?: unknown) => void;

export const useAwaitableNavigate = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlKey = pathname + params.toString();
  const resolveFunctionsRef = React.useRef<Resolve[]>([]);

  const awaitableNav = useCallback(
    (to: string) => {
      return new Promise(resolve => {
        resolveFunctionsRef.current.push(resolve);
        return router.push(to);
      });
    },
    [urlKey],
  );

  useEffect(() => {
    resolveFunctionsRef.current.forEach(resolve => resolve());
    resolveFunctionsRef.current = [];
  }, [urlKey]);

  return awaitableNav;
};
