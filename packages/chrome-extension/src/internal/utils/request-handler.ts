import type { Clerk } from '@clerk/clerk-js';

import { AUTH_HEADER } from '../constants';
import type { JWTHandler } from './jwt-handler';

type Handler = Parameters<Clerk['__internal_onBeforeRequest']>[0];
type Req = Parameters<Handler>[0];

/** Append the JWT to the FAPI request if one is present, otherwise create a new one and append */
export function requestHandler(
  jwtHandler: JWTHandler,
  { isProd, frontendApi }: { isProd: boolean; frontendApi: string },
): Handler {
  let devBrowserCreationPromise: Promise<string | undefined> | undefined;

  async function getOrCreateDevBrowserJWT(): Promise<string | undefined> {
    // If dev browser exists then return it -- happy path
    const existing = await jwtHandler.get();
    if (existing) {
      return existing;
    }

    // If there is no dev broswer then user likely hasn't visited web app yet. Create one
    // Prevents "Unable to authenticate this browser for your development instance..." error
    if (!devBrowserCreationPromise) {
      devBrowserCreationPromise = (async () => {
        try {
          const resp = await globalThis.fetch(`https://${frontendApi}/v1/dev_browser`, {
            method: 'POST',
          });

          if (!resp.ok) {
            console.error(`Clerk: Failed to create dev browser token (HTTP ${resp.status})`);
            return undefined;
          }

          const data = await resp.json();
          const token: string | undefined = data?.token ?? data?.id;

          // Set new token as __clerk_db_jwt cookie
          if (token) {
            await jwtHandler.set(token);
          }

          return token;
        } catch (err) {
          console.error('Clerk: Failed to create dev browser token', err);
          return undefined;
        } finally {
          devBrowserCreationPromise = undefined;
        }
      })();
    }

    return devBrowserCreationPromise;
  }

  const handler: Handler = async requestInit => {
    requestInit.credentials = 'omit';

    if (isProd) {
      const currentJWT = await jwtHandler.get();
      if (!currentJWT) {
        return;
      }
      prodHandler(requestInit, currentJWT);
    } else {
      const currentJWT = await getOrCreateDevBrowserJWT();
      if (!currentJWT) {
        return;
      }
      devHandler(requestInit, currentJWT);
    }
  };

  return handler;
}

/** Append the JWT to the FAPI request, per development instances */
function devHandler(requestInit: Req, jwt: string) {
  requestInit.url?.searchParams.append('__clerk_db_jwt', jwt);
}

/** Append the JWT to the FAPI request, per production instances */
function prodHandler(requestInit: Req, jwt: string) {
  requestInit.url?.searchParams.append('_is_native', '1');
  (requestInit.headers as Headers).set(AUTH_HEADER.PRODUCTION, `Bearer ${jwt}`);
}
