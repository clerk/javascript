'use client';

import type { AccountlessApplication } from '@clerk/backend';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { canUseAccountless__client } from '../../utils/feature-flags';

export function AccountlessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  useEffect(() => {
    if (canUseAccountless__client) {
      void import('../accountless-actions.js').then(m =>
        m.syncAccountlessKeysAction({
          ...props,
          // Preserve the current url and return back, once keys are synced in the middleware
          returnUrl: window.location.href,
        }),
      );
    }
  }, []);

  return props.children;
}
