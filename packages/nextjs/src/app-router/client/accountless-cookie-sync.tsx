'use client';

import type { AccountlessApplication } from '@clerk/backend';
import nextPkg from 'next/package.json';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

const isNext13 = nextPkg.version.startsWith('13.');
export function AccountlessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  if (!isNext13) {
    useEffect(() => {
      void import('../accountless-actions.js').then(m => m.syncAccountlessKeysAction(props));
      // void syncAccountlessKeysAction(props);
    }, []);
  }

  return props.children;
}
