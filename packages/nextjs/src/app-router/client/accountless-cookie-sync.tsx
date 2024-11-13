'use client';

import type { AccountlessApplication } from '@clerk/backend';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { syncAccountlessKeys } from '../server-actions';

export function AccountlessCookieSync(props: PropsWithChildren<AccountlessApplication>) {
  useEffect(() => {
    void syncAccountlessKeys(props);
  }, []);

  return props.children;
}
