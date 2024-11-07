import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

const getClerkPath = () => path.join(process.cwd(), '.clerk', '.tmp', 'accountless.json');
const getEnvPath = () => path.join(process.cwd(), '.env.local');

// function parseEnvToMap(content: string): Map<string, string> {
//   const config = new Map<string, string>();
//
//   // Split content into lines
//   const lines = content.split('\n');
//
//   for (const line of lines) {
//     // Trim whitespace
//     const trimmedLine = line.trim();
//
//     // Ignore empty lines and comments (lines that start with #)
//     if (trimmedLine === '' || trimmedLine.startsWith('#')) {
//       continue;
//     }
//
//     // Split the line by the first '='
//     const separatorIndex = trimmedLine.indexOf('=');
//     if (separatorIndex === -1) {
//       continue; // Skip lines without '='
//     }
//
//     const key = trimmedLine.slice(0, separatorIndex).trim();
//     let value = trimmedLine.slice(separatorIndex + 1).trim();
//
//     // Remove surrounding quotes from the value if they exist
//     if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
//       value = value.slice(1, -1);
//     }
//
//     config.set(key, value);
//   }
//
//   return config;
// }

// function updateGitignore() {
//   const gitignorePath = path.join(process.cwd(), '.gitignore');
//
//   if (!fs.existsSync(gitignorePath)) {
//     fs.writeFileSync(gitignorePath, '');
//     console.log('.gitignore created.');
//   } else {
//     console.log('.gitignore found.');
//   }
//
//   // Check if `.clerk/` entry exists in .gitignore
//   const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
//   if (!gitignoreContent.includes('.env.local')) {
//     fs.appendFileSync(gitignorePath, '\n.env.local\n');
//     console.log('.env.local added to .gitignore.');
//   } else {
//     console.log('.env.local is already ignored.');
//   }
//   // } else {
//   //   console.log('.git directory not found. Skipping .gitignore update.');
//   // }
// }
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

  let clerkFileAsString: string | null = null;
  try {
    clerkFileAsString = readFileSync(getClerkPath(), { encoding: 'utf-8' });
  } catch {
    clerkFileAsString = null;
  }

  console.log('PROVIDER', publishableKey, clerkFileAsString);

  if (!publishableKey && !clerkFileAsString) {
    // this can be without access to headers
    // const resolvedClient = await clerkClient();
    // const resolvedCookies = await cookies();
    let res: any;
    try {
      const ENV_PATH = getEnvPath();
      const CLERK_TMP_PATH = getClerkPath();
      mkdirSync(path.dirname(ENV_PATH), { recursive: true });
      mkdirSync(path.dirname(CLERK_TMP_PATH), { recursive: true });
      writeFileSync(CLERK_TMP_PATH, '', {
        encoding: 'utf8',
        mode: '0777',
        flag: 'w',
      });

      // updateGitignore();

      // const clerkFileConfig = JSON.parse(clerkFileAsString);
      // const fileAsString = await readFile(ENV_PATH, { encoding: 'utf-8' }).catch(() => '');

      // const envVarsMap = parseEnvToMap(fileAsString);

      // res = JSON.parse(one);
      //
      // console.log('-----config', res, PATH);

      /**
       * Maybe the server has not restarted yet
       */
      if (!clerkFileAsString) {
        const client = createClerkClientWithOptions({});

        res = await client.accountlessApplications.createAccountlessApplication();

        writeFileSync(CLERK_TMP_PATH, JSON.stringify(res), {
          encoding: 'utf8',
          mode: '0777',
          flag: 'w',
        });

        writeFileSync(
          ENV_PATH,
          `\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${res.publishable_key}
          \nCLERK_SECRET_KEY=${res.secret_key}
          `,
          {
            encoding: 'utf8',
            mode: '0777',
            flag: 'a',
          },
        );

        publishableKey = res.publishable_key;

        console.log('---CREATED', res);
      }
    } catch (e) {
      console.log('--dwadawda', e);
    }
  } else {
    // rmSync('.clerk', { recursive: true, force: true });
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
