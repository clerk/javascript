import { constants, fetchEphemeralAccount } from '@clerk/backend/internal';
import type { InitialState, Without } from '@clerk/types';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { initialState } from './auth';
import { getScriptNonceFromHeader } from './utils';

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, ...rest } = props;
  const state = initialState()?.__clerk_ssr_state as InitialState;
  const cspHeader = headers().get('Content-Security-Policy');

  const providerProps = { ...mergeNextClerkPropsWithEnv(rest) };

  if (!providerProps.publishableKey) {
    const ephemeralAccount = await fetchEphemeralAccount();
    const cookieExpiresAt = cookies().get(constants.QueryParameters.EphemeralExpiresAt)?.value;
    const cookiePublishableKey = cookies().get(constants.QueryParameters.EphemeralPublishableKey)?.value;
    const cookieSecretKey = cookies().get(constants.QueryParameters.EphemeralSecretKey)?.value;

    const stale =
      cookieExpiresAt !== String(ephemeralAccount.expiresAt) ||
      cookiePublishableKey !== ephemeralAccount.publishableKey ||
      cookieSecretKey !== ephemeralAccount.secretKey;

    if (stale) {
      const params = new URLSearchParams({
        [constants.QueryParameters.EphemeralExpiresAt]: String(ephemeralAccount.expiresAt),
        [constants.QueryParameters.EphemeralPublishableKey]: ephemeralAccount.publishableKey,
        [constants.QueryParameters.EphemeralSecretKey]: ephemeralAccount.secretKey,
      });

      redirect(`?${params}`);
    }

    providerProps.ephemeral = true;
    providerProps.publishableKey = ephemeralAccount.publishableKey;
  }

  return (
    <ClientClerkProvider
      {...providerProps}
      nonce={getScriptNonceFromHeader(cspHeader || '')}
      initialState={state}
    >
      {children}
    </ClientClerkProvider>
  );
}
