import fs from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import type { InitialState, Without } from '@clerk/types';
import { header } from 'ezheaders';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import nextPkg from 'next/package.json';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import { createClerkClientWithOptions } from '../../server/clerkClient';
import { getHeader } from '../../server/utils';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

const getPath = () => path.join(process.cwd(), '.clerk', '.tmp', 'accountless.json');

function updateGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '');
    console.log('.gitignore created.');
  } else {
    console.log('.gitignore found.');
  }

  // Check if `.clerk/` entry exists in .gitignore
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  if (!gitignoreContent.includes('.clerk/')) {
    fs.appendFileSync(gitignorePath, '\n.clerk/\n');
    console.log('.clerk/ added to .gitignore.');
  } else {
    console.log('.clerk/ is already ignored.');
  }
  // } else {
  //   console.log('.git directory not found. Skipping .gitignore update.');
  // }
}
const isNext13 = nextPkg.version.startsWith('13.');

const getDynamicClerkState = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const data = getDynamicAuthData(request);

  return data;
});

const getDynamicConfig = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const encoded = getHeader(request, constants.Headers.ClerkPublicRequestConfig);

  if (encoded) {
    return JSON.parse(encoded);
  }
  return {};
});

const getNonceFromCSPHeader = React.cache(async function getNonceFromCSPHeader() {
  return getScriptNonceFromHeader((await header('Content-Security-Policy')) || '') || '';
});

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;
  let statePromise: Promise<null | AuthObject> = Promise.resolve(null);
  let nonce = Promise.resolve('');

  if (dynamic) {
    if (isNext13) {
      /**
       * For some reason, Next 13 requires that functions which call `headers()` are awaited where they are invoked.
       * Without the await here, Next will throw a DynamicServerError during build.
       */
      statePromise = Promise.resolve(await getDynamicClerkState());
      nonce = Promise.resolve(await getNonceFromCSPHeader());
    } else {
      statePromise = getDynamicClerkState();
      nonce = getNonceFromCSPHeader();
    }
  }

  const dynamicConfig = await getDynamicConfig();

  let publishableKey = rest.publishableKey || dynamicConfig.publishableKey;

  if (!publishableKey) {
    // this can be without access to headers
    // const resolvedClient = await clerkClient();
    const resolvedCookies = await cookies();
    let res: any;
    try {
      const PATH = getPath();
      await mkdir(path.dirname(PATH), { recursive: true });
      updateGitignore();

      const one = await readFile(PATH, { encoding: 'utf-8' }).catch(() => 'null');

      res = JSON.parse(one);

      console.log('-----config', res, PATH);

      if (!res) {
        const client = createClerkClientWithOptions({});

        res = await client.accountlessApplications.createAccountlessApplication();

        await writeFile(PATH, JSON.stringify(res), {
          encoding: 'utf8',
          mode: '0777',
          flag: 'w',
        });

        console.log('---CREATED', res);
      }
    } catch (e) {
      console.log('--dwadawda', e);
    }
    // const accountless = await resolvedClient.accountlessApplications.createAccountlessApplication();
    const cookiePublishableKey = resolvedCookies.get('acc-pk')?.value;
    const cookieSecretKey = resolvedCookies.get('acc-sk')?.value;

    const stale =
      // cookieExpiresAt !== String(ephemeralAccount.expiresAt) ||
      cookiePublishableKey !== res.publishable_key || cookieSecretKey !== res.secret_key;

    if (stale) {
      const params = new URLSearchParams({
        // [constants.QueryParameters.EphemeralExpiresAt]: String(ephemeralAccount.expiresAt),
        ['acc-pk']: res.publishable_key,
        ['acc-sk']: res.secret_key,
      });

      redirect(`?${params}`);
    }

    publishableKey = cookiePublishableKey;
  }

  const output = (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv({
        ...dynamicConfig,
        ...rest,
        publishableKey,
      })}
      nonce={await nonce}
      initialState={await statePromise}
    >
      {children}
    </ClientClerkProvider>
  );

  if (dynamic) {
    return (
      // TODO: fix types so AuthObject is compatible with InitialState
      <PromisifiedAuthProvider authPromise={statePromise as unknown as Promise<InitialState>}>
        {output}
      </PromisifiedAuthProvider>
    );
  }

  return output;
}
