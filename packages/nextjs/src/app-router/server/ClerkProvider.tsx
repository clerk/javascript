import type { AuthObject } from '@clerk/backend';
import type { Without } from '@clerk/types';
import React from 'react';

import { getDynamicAuthData } from '../../server/buildClerkProps';
import type { NextClerkProviderProps } from '../../types';
import { canUseKeyless__server } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { isNext13 } from '../../utils/sdk-versions';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

// const getNonceFromCSPHeader = async function getNonceFromCSPHeader() {
//   // const request =
//   // await buildRequestLike();
//   // return '';
//   const request = await buildRequestLike();
//   // const data =
//   getDynamicAuthData(request);
//
//   return '';
//   // try {
//   // return getScriptNonceFromHeader(request.headers.get('Content-Security-Policy') || '') || '';
//   // } catch (e) {
//   //   console.log('Failed from getNonceFromCSPHeader', e);
//   // }
//   // return '';
// };

const getDynamicClerkState = async function getDynamicClerkState() {
  // try {
  const request = await buildRequestLike();
  const data = getDynamicAuthData(request);

  return [data, getScriptNonceFromHeader(request.headers.get('Content-Security-Policy') || '') || ''] as [
    AuthObject,
    string,
  ];
  // } catch (e) {
  //   console.log('Failed getDynamicClerkState', e);
  // }
  // return null;
};
getDynamicClerkState;

// getNonceFromCSPHeader;

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;
  let statePromise: Promise<[null | AuthObject, string]> = Promise.resolve([null, '']);
  // const nonce = Promise.resolve('');

  if (dynamic) {
    if (isNext13) {
      /**
       * For some reason, Next 13 requires that functions which call `headers()` are awaited where they are invoked.
       * Without the await here, Next will throw a DynamicServerError during build.
       */
      // statePromise = Promise.resolve(await getDynamicClerkState());
      // nonce = Promise.resolve(await getNonceFromCSPHeader());
    } else {
      statePromise = getDynamicClerkState();
      // nonce = getNonceFromCSPHeader();
    }
  }

  const propsWithEnvs = mergeNextClerkPropsWithEnv({
    ...rest,
  });

  let output = (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      initialState={(await statePromise)[0]}
      nonce={(await statePromise)[1]}
    >
      {children}
    </ClientClerkProvider>
  );

  const shouldRunAsKeyless = !propsWithEnvs.publishableKey && canUseKeyless__server;

  if (shouldRunAsKeyless) {
    // NOTE: Create or read keys on every render. Usually this means only on hard refresh or hard navigations.
    const newOrReadKeys = await import('../../server/keyless-node.js').then(mod => mod.createOrReadKeyless());

    if (newOrReadKeys) {
      const KeylessCookieSync = await import('../client/keyless-cookie-sync.js').then(mod => mod.KeylessCookieSync);
      output = (
        <KeylessCookieSync {...newOrReadKeys}>
          <ClientClerkProvider
            {...mergeNextClerkPropsWithEnv({
              ...rest,
              publishableKey: newOrReadKeys.publishableKey,
              __internal_claimKeylessApplicationUrl: newOrReadKeys.claimUrl,
              __internal_copyInstanceKeysUrl: newOrReadKeys.apiKeysUrl,
            })}
            initialState={(await statePromise)[0]}
            nonce={(await statePromise)[1]}
          >
            {children}
          </ClientClerkProvider>
        </KeylessCookieSync>
      );
    }
  }

  // if (dynamic) {
  //   return (
  //     // TODO: fix types so AuthObject is compatible with InitialState
  //     <PromisifiedAuthProvider authPromise={statePromise as unknown as Promise<InitialState>}>
  //       {output}
  //     </PromisifiedAuthProvider>
  //   );
  // }

  return output;
}
