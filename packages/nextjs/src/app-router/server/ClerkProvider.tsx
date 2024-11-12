import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { AccountlessApplication, AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import type { InitialState, Without } from '@clerk/types';
import { header } from 'ezheaders';
import nextPkg from 'next/package.json';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import { createClerkClientWithOptions } from '../../server/clerkClient';
import { getHeader } from '../../server/utils';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { AccountlessCookieSync } from '../client/accountless-cookie-sync';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

const CLERK_HIDDEN = '.clerk';

function updateGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, '');
    console.log('.gitignore created.');
  } else {
    console.log('.gitignore found.');
  }

  // Check if `.clerk/` entry exists in .gitignore
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  if (!gitignoreContent.includes(CLERK_HIDDEN + '/')) {
    appendFileSync(gitignorePath, `\n${CLERK_HIDDEN}/\n`);
    console.log('.clerk/ added to .gitignore.');
  } else {
    console.log('.clerk/ is already ignored.');
  }
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

const CLERK_LOCK = 'clerk.lock';
const getClerkPath = () => path.join(process.cwd(), '.clerk', '.tmp', 'accountless.json');

let isCreatingFile = false;

export async function createAccountlessKeys(publishableKey: string | undefined): Promise<NonNullable<unknown>> {
  if (publishableKey) {
    return {};
  }

  if (isCreatingFile) {
    return {};
  }

  if (existsSync(CLERK_LOCK)) {
    return {};
  }

  isCreatingFile = true;

  writeFileSync(CLERK_LOCK, 'You can delete this file.', {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  const CLERK_PATH = getClerkPath();
  mkdirSync(path.dirname(CLERK_PATH), { recursive: true });
  updateGitignore();

  let fileAsString;
  try {
    fileAsString = readFileSync(CLERK_PATH, { encoding: 'utf-8' });
  } catch {
    fileAsString = '{}';
  }
  const envVarsMap = JSON.parse(fileAsString);

  if (envVarsMap.publishable_key && envVarsMap.secret_key) {
    isCreatingFile = false;
    rmSync(CLERK_LOCK, { force: true, recursive: true });
    return envVarsMap;
  }

  /**
   * Maybe the server has not restarted yet
   */

  const client = createClerkClientWithOptions({});

  const accountlessApplication = await client.accountlessApplications.createAccountlessApplication();

  console.log('--- new keys', accountlessApplication);

  writeFileSync(CLERK_PATH, JSON.stringify(accountlessApplication), {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  rmSync(CLERK_LOCK, { force: true, recursive: true });

  isCreatingFile = false;
  return accountlessApplication;
}

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

  let output = (
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

  if (!publishableKey) {
    const res = (await createAccountlessKeys(publishableKey)) as AccountlessApplication;
    publishableKey = res.publishableKey;

    output = (
      <html>
        <body>
          <AccountlessCookieSync {...res}>
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
          </AccountlessCookieSync>
        </body>
      </html>
    );
  }

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
