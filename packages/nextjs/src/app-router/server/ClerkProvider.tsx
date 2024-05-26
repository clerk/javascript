import type { InitialState, Without } from '@clerk/types';
import { cookies } from 'next/headers';
import React, { Suspense } from 'react';

import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { initialState } from './auth';

const fapi = 'https://artistic-tapir-20.clerk.accounts.dev';
const clerkVersion = '5.5.2';

const fetchEnvironment = (url: string) =>
  // new Promise((_, reject) => setTimeout(() => reject(url), 10000)).catch(() => ({}));
  fetch(url, {
    credentials: 'include',
  }).then(res => res.json());

export function ClerkProvider(props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>) {
  const { children, ...rest } = props;
  const state = initialState()?.__clerk_ssr_state as InitialState;
  const db_jwt = cookies().get('__clerk_db_jwt')?.value;
  const wow = fetchEnvironment(`${fapi}/v1/environment?_clerk_js_version=${clerkVersion}&__clerk_db_jwt=${db_jwt}`);
  const client = fetchEnvironment(`${fapi}/v1/client?_clerk_js_version=${clerkVersion}&__clerk_db_jwt=${db_jwt}`);
  // console.log('wow', wow.);

  return (
    <Suspense fallback={'loading'}>
      <ClientClerkProvider
        {...mergeNextClerkPropsWithEnv(rest)}
        initialState={state}
        // env={new Promise(res => setTimeout(() => res('lol2'), 10000))}
        env={wow}
        client={client}
      >
        {children}
      </ClientClerkProvider>
    </Suspense>
  );
}
