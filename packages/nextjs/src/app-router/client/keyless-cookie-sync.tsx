'use client';

import type { AccountlessApplication } from '@clerk/backend';
import { useSelectedLayoutSegments } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { canUseKeyless } from '../../utils/feature-flags';

export function KeylessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  const segments = useSelectedLayoutSegments();
  const isNotFoundRoute = segments[0]?.startsWith('/_not-found') || false;

  useEffect(() => {
    if (canUseKeyless && !isNotFoundRoute) {
      void import('../keyless-actions.js').then(m =>
        m.syncKeylessConfigAction({
          ...props,
          // Preserve the current url and return back, once keys are synced in the middleware
          returnUrl: window.location.href,
        }),
      );
    }
  }, [isNotFoundRoute]);

  return props.children;
}
