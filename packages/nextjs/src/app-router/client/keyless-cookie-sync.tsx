'use client';

import type { AccountlessApplication } from '@clerk/backend';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { canUseKeyless } from '../../utils/feature-flags';

export function KeylessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  useEffect(() => {
    if (canUseKeyless) {
      // eslint-disable-next-line import/no-unresolved
      void import('../keyless-actions.js').then(m =>
        m.syncKeylessConfigAction({
          ...props,
          // Preserve the current url and return back, once keys are synced in the middleware
          returnUrl: window.location.href,
        }),
      );
    }
  }, []);

  return props.children;
}
