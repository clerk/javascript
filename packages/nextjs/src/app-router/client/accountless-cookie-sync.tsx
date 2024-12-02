'use client';

import type { AccountlessApplication } from '@clerk/backend';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { canUseKeyless__client } from '../../utils/feature-flags';

export function KeylessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  useEffect(() => {
    if (canUseKeyless__client) {
      void import('../accountless-actions.js').then(m =>
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
