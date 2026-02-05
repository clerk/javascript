import type { Ui } from '@clerk/react/internal';
import type { InitialState, Without } from '@clerk/shared/types';
import React, { Suspense } from 'react';

import { getDynamicAuthData } from '../../server/buildClerkProps';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { DynamicClerkScripts } from './DynamicClerkScripts';
import { getKeylessStatus, KeylessProvider } from './keyless-provider';
import { buildRequestLike } from './utils';

const getDynamicClerkState = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const data = getDynamicAuthData(request);

  return data;
});

export async function ClerkProvider<TUi extends Ui = Ui>(
  props: Without<NextClerkProviderProps<TUi>, '__internal_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;

  const statePromiseOrValue = dynamic ? getDynamicClerkState() : undefined;

  const propsWithEnvs = mergeNextClerkPropsWithEnv({
    ...rest,
    // Even though we always cast to InitialState here, this might still be a promise.
    // While not reflected in the public types, we do support this for React >= 19 for internal use.
    initialState: statePromiseOrValue as InitialState | undefined,
  });

  const { shouldRunAsKeyless, runningWithClaimedKeys } = await getKeylessStatus(propsWithEnvs);

  // When dynamic mode is enabled, render scripts in a Suspense boundary to isolate
  // the nonce fetching (which calls headers()) from the rest of the page.
  // This allows the page to remain statically renderable / use PPR.
  const dynamicScripts = dynamic ? (
    <Suspense>
      <DynamicClerkScripts
        publishableKey={propsWithEnvs.publishableKey}
        clerkJSUrl={propsWithEnvs.clerkJSUrl}
        clerkJSVersion={propsWithEnvs.clerkJSVersion}
        clerkUIUrl={propsWithEnvs.clerkUIUrl}
        domain={propsWithEnvs.domain}
        proxyUrl={propsWithEnvs.proxyUrl}
        prefetchUI={propsWithEnvs.prefetchUI}
      />
    </Suspense>
  ) : null;

  if (shouldRunAsKeyless) {
    return (
      <KeylessProvider
        rest={propsWithEnvs}
        runningWithClaimedKeys={runningWithClaimedKeys}
        __internal_skipScripts={dynamic}
      >
        {dynamicScripts}
        {children}
      </KeylessProvider>
    );
  }

  return (
    <ClientClerkProvider
      {...propsWithEnvs}
      __internal_skipScripts={dynamic}
    >
      {dynamicScripts}
      {children}
    </ClientClerkProvider>
  );
}
