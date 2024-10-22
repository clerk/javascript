import React from 'react';

import { getDynamicAuthData } from '../../server/buildClerkProps';
import { PromisifiedAuthProvider } from '../client/ClerkDynamicProvider';
import { buildRequestLike } from './utils';

interface ClerkDynamicProviderOptions {
  dynamic?: boolean;
  children?: React.ReactNode;
}

async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const data = await getDynamicAuthData(request);

  return data;
}

export async function ClerkDynamicProvider({ children }: ClerkDynamicProviderOptions) {
  const dataPromise = getDynamicClerkState();
  return <PromisifiedAuthProvider authPromise={dataPromise}>{children}</PromisifiedAuthProvider>;
}
