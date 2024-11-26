'use client';

import type { AccountlessApplication } from '@clerk/backend';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { isNextWithUnstableServerActions } from '../../utils/sdk-versions';

export function AccountlessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  useEffect(() => {
    if (!isNextWithUnstableServerActions) {
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
