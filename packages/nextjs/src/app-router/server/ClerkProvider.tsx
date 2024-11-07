import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { AuthObject } from '@clerk/backend';
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
import { ClientClerkProvider } from '../client/ClerkProvider';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

function parseEnvToMap(content: string): Map<string, string> {
  const config = new Map<string, string>();

  // Split content into lines
  const lines = content.split('\n');

  for (const line of lines) {
    // Trim whitespace
    const trimmedLine = line.trim();

    // Ignore empty lines and comments (lines that start with #)
    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }

    // Split the line by the first '='
    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) {
      continue; // Skip lines without '='
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();

    // Remove surrounding quotes from the value if they exist
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    config.set(key, value);
  }

  return config;
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
const getEnvPath = () => path.join(process.cwd(), '.env.local');

let isCreatingFile = false;

export async function createAccountlessKeys(publishableKey: string | undefined): Promise<void> {
  if (publishableKey) {
    return;
  }

  if (isCreatingFile) {
    return;
  }

  if (existsSync(CLERK_LOCK)) {
    return;
  }

  isCreatingFile = true;

  writeFileSync(CLERK_LOCK, 'You can delete this file.', {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  let res: any;

  const ENV_PATH = getEnvPath();
  mkdirSync(path.dirname(ENV_PATH), { recursive: true });

  const fileAsString = readFileSync(ENV_PATH, { encoding: 'utf-8' });
  const envVarsMap = parseEnvToMap(fileAsString);

  if (envVarsMap.has('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')) {
    isCreatingFile = false;
    rmSync(CLERK_LOCK, { force: true, recursive: true });
    return;
  }

  /**
   * Maybe the server has not restarted yet
   */

  const client = createClerkClientWithOptions({});

  // eslint-disable-next-line prefer-const
  res = await client.accountlessApplications.createAccountlessApplication();

  writeFileSync(
    ENV_PATH,
    `\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${res.publishable_key}\nCLERK_SECRET_KEY=${res.secret_key}\nNEXT_PUBLIC_CLERK_ACC_CLAIM_TOKEN=${res.claim_token}`,
    {
      encoding: 'utf8',
      mode: '0777',
      flag: 'a',
    },
  );

  rmSync(CLERK_LOCK, { force: true, recursive: true });

  isCreatingFile = false;
  return res.publishable_key;
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
  publishableKey = await createAccountlessKeys(publishableKey);

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
