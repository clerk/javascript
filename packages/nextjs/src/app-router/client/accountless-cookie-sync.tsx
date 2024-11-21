'use client';

import type { AccountlessApplication } from '@clerk/backend';
import nextPkg from 'next/package.json';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

const isBrokenNextVersion = nextPkg.version.startsWith('13.') || nextPkg.version.startsWith('14.0');
export function AccountlessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  useEffect(() => {
    if (!isBrokenNextVersion) {
      void import('../accountless-actions.js').then(m =>
        m.syncAccountlessKeysAction({ ...props, returnUrl: window.location.href }),
      );
    }
  }, []);

  return props.children;
}
