'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { PageMockConfig, PageMockingState } from './PageMocking';
import { PageMocking } from './PageMocking';

export type { PageMockConfig } from './PageMocking';

export function usePageMocking(config?: PageMockConfig) {
  const pathname = usePathname();
  const pageMockingRef = useRef<PageMocking | null>(null);
  const [state, setState] = useState<PageMockingState>({
    controller: null,
    error: null,
    isEnabled: false,
    isReady: false,
  });

  useEffect(() => {
    let mounted = true;

    // Create the PageMocking instance if it doesn't exist
    if (!pageMockingRef.current) {
      pageMockingRef.current = new PageMocking({
        onStateChange: newState => {
          if (mounted) {
            setState(newState);
          }
        },
      });
    }

    const pageMocking = pageMockingRef.current;

    pageMocking.initialize(pathname, config);

    return () => {
      mounted = false;
      pageMocking.cleanup();
    };
  }, [pathname]);

  return {
    error: state.error,
    isEnabled: state.isEnabled,
    isReady: state.isReady,
    pathname,
  };
}
