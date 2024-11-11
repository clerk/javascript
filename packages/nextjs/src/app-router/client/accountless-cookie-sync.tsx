'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { syncAccountlessKeys } from '../server-actions';

export function AccountlessCookieSync(
  props: PropsWithChildren<{
    publishable_key: string;
    secret_key: string;
    claim_token: string;
  }>,
) {
  const { claim_token, secret_key, publishable_key } = props;
  useEffect(() => {
    void syncAccountlessKeys({ claim_token, secret_key, publishable_key });
  }, []);

  return null;
}
