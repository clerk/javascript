'use client';
// !!! Note the import from react
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';

declare global {
  export interface Window {
    __clerk_nav_await: Array<(value: void) => void>;
    __clerk_nav: (to: string) => Promise<void>;
  }
}

export const useAwaitableNavigate = () => {
  const { push, refresh } = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    window.__clerk_nav = (to: string) => {
      return new Promise(res => {
        window.__clerk_nav_await.push(res);
        if (to === pathname) {
          refresh();
        } else {
          push(to);
        }
      });
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window.__clerk_nav_await === 'undefined') {
      window.__clerk_nav_await = [];
    }
    window.__clerk_nav_await.forEach(resolve => resolve());
    window.__clerk_nav_await = [];
  });

  return useCallback((to: string) => {
    return window.__clerk_nav(to);
  }, []);
};

export function ClerkProvider(props: React.PropsWithChildren<{ initialState: any }>) {
  const { children, initialState } = props;
  const navigate = useAwaitableNavigate();
  return (
    // @ts-expect-error
    <ReactClerkProvider
      frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || ''}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
      navigate={navigate}
      initialState={initialState}
    >
      {children}
    </ReactClerkProvider>
  );
}
