import {
  DEV_BROWSER_JWT_HEADER,
  DEV_BROWSER_JWT_KEY,
  extractDevBrowserJWTFromURL,
  setDevBrowserJWTInURL,
} from '@clerk/shared/devBrowser';
import { parseErrors } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON } from '@clerk/shared/types';

import { isDevOrStagingUrl } from '../../utils';
import { clerkErrorDevInitFailed } from '../errors';
import type { FapiClient } from '../fapiClient';
import { createDevBrowserCookie } from './cookies/devBrowser';

export interface DevBrowser {
  clear(): void;

  setup(): Promise<void>;

  getDevBrowserJWT(): string | undefined;

  setDevBrowserJWT(jwt: string): void;

  removeDevBrowserJWT(): void;
}

export type CreateDevBrowserOptions = {
  frontendApi: string;
  cookieSuffix: string;
  fapiClient: FapiClient;
};

export function createDevBrowser({ cookieSuffix, frontendApi, fapiClient }: CreateDevBrowserOptions): DevBrowser {
  const devBrowserCookie = createDevBrowserCookie(cookieSuffix);
  let inMemoryDevBrowserJWT: string | undefined;

  const getStoredDevBrowserJWT = () => {
    try {
      if (typeof window === 'undefined') {
        return undefined;
      }
      return window.localStorage.getItem(DEV_BROWSER_JWT_KEY) || undefined;
    } catch {
      return undefined;
    }
  };

  const setStoredDevBrowserJWT = (jwt: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(DEV_BROWSER_JWT_KEY, jwt);
      }
    } catch {
      // Best effort only. Some embedded environments disable storage access.
    }
  };

  const removeStoredDevBrowserJWT = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(DEV_BROWSER_JWT_KEY);
      }
    } catch {
      // Best effort only.
    }
  };

  function getDevBrowserJWT() {
    return devBrowserCookie.get() || getStoredDevBrowserJWT() || inMemoryDevBrowserJWT;
  }

  function setDevBrowserJWT(jwt: string) {
    inMemoryDevBrowserJWT = jwt;
    devBrowserCookie.set(jwt);
    setStoredDevBrowserJWT(jwt);
  }

  function removeDevBrowserJWT() {
    inMemoryDevBrowserJWT = undefined;
    devBrowserCookie.remove();
    removeStoredDevBrowserJWT();
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

    // 1. Get the JWT from search parameters when the redirection comes from AP
    const devBrowserToken = extractDevBrowserJWTFromURL(new URL(window.location.href));
    if (devBrowserToken) {
      setDevBrowserJWT(devBrowserToken);
      return;
    }

    // 2. If no JWT is found in the first step, check if a JWT is already available in the __clerk_db_jwt JS cookie
    if (getDevBrowserJWT()) {
      return;
    }

    // 3. Otherwise, fetch a new DevBrowser JWT from FAPI and set it in the __clerk_db_jwt JS cookie
    const createDevBrowserUrl = fapiClient.buildUrl({
      path: '/dev_browser',
    });

    const response = await fetch(createDevBrowserUrl.toString(), {
      method: 'POST',
    });

    if (!response.ok) {
      const data = await response.json();
      const errors = parseErrors(data.errors as ClerkAPIErrorJSON[]);
      if (errors[0]) {
        clerkErrorDevInitFailed(errors[0].longMessage);
      } else {
        clerkErrorDevInitFailed();
      }
    }

    const data = await response.json();
    setDevBrowserJWT(data?.id);
  }

  return {
    clear,
    setup,
    getDevBrowserJWT,
    setDevBrowserJWT,
    removeDevBrowserJWT,
  };
}
