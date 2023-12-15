import { DEV_BROWSER_JWT_HEADER, getDevBrowserJWTFromURL, setDevBrowserJWTInURL } from '@clerk/shared/devBrowser';

import { isDevOrStagingUrl } from '../utils';
import { getDevBrowserCookie, removeDevBrowserCookie, setDevBrowserCookie } from '../utils/cookies/devBrowser';
import { clerkErrorDevInitFailed } from './errors';
import type { FapiClient } from './fapiClient';

export interface DevBrowser {
  clear(): void;

  setup(): Promise<void>;

  getDevBrowserJWT(): string | undefined;

  setDevBrowserJWT(jwt: string): void;

  removeDevBrowserJWT(): void;
}

export type CreateDevBrowserOptions = {
  frontendApi: string;
  fapiClient: FapiClient;
};

export function createDevBrowser({ frontendApi, fapiClient }: CreateDevBrowserOptions): DevBrowser {
  function getDevBrowserJWT() {
    return getDevBrowserCookie();
  }

  function setDevBrowserJWT(jwt: string) {
    setDevBrowserCookie(jwt);
  }

  function removeDevBrowserJWT() {
    removeDevBrowserCookie();
  }

  function clear() {
    removeDevBrowserJWT();
  }

  async function setup(): Promise<void> {
    if (!isDevOrStagingUrl(frontendApi)) {
      return;
    }

    // 1. Set network interceptors to Pass dev
    fapiClient.onBeforeRequest(request => {
      const devBrowserJWT = getDevBrowserJWT();
      if (devBrowserJWT && request?.url) {
        request.url = setDevBrowserJWTInURL(request.url, devBrowserJWT);
      }
    });

    fapiClient.onAfterResponse((_, response) => {
      const newDevBrowserJWT = response?.headers?.get(DEV_BROWSER_JWT_HEADER);
      if (newDevBrowserJWT) {
        setDevBrowserJWT(newDevBrowserJWT);
      }
    });

    // 1. If a cookie already exists, it might have SameSite=Strict. Re-set it to make sure it has SameSite=Lax
    const existingDevBrowserCookie = getDevBrowserCookie();
    if (existingDevBrowserCookie) {
      removeDevBrowserCookie();
      setDevBrowserCookie(existingDevBrowserCookie);
    }

    // 2. Get the JWT from hash or search parameters when the redirection comes from AP
    const devBrowserToken = getDevBrowserJWTFromURL(new URL(window.location.href));
    if (devBrowserToken) {
      setDevBrowserJWT(devBrowserToken);
      return;
    }

    // 3. If no JWT is found in the first step, check if a JWT is already available in the JS cookie
    if (getDevBrowserCookie()) {
      return;
    }

    // 4. Otherwise, fetch a new DevBrowser JWT from FAPI and cache it
    const createDevBrowserUrl = fapiClient.buildUrl({
      path: '/dev_browser',
    });

    const resp = await fetch(createDevBrowserUrl.toString(), {
      method: 'POST',
    });

    if (!resp.ok) {
      clerkErrorDevInitFailed();
    }

    const data = await resp.json();
    setDevBrowserJWT(data?.token);
  }

  return {
    clear,
    setup,
    getDevBrowserJWT,
    setDevBrowserJWT,
    removeDevBrowserJWT,
  };
}
