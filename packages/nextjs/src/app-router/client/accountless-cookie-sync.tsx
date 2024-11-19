'use client';

import type { AccountlessApplication } from '@clerk/backend';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { syncAccountlessKeysAction } from '../accountless-actions';

export function AccountlessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  useEffect(() => {
    void syncAccountlessKeysAction(props);
  }, []);

  return props.children;
}
