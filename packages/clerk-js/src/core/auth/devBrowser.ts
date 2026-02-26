import { DEV_BROWSER_HEADER, extractDevBrowserFromURL, setDevBrowserInURL } from '@clerk/shared/devBrowser';
import { parseErrors } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON } from '@clerk/shared/types';

import { isDevOrStagingUrl } from '../../utils';
import { clerkErrorDevInitFailed } from '../errors';
import type { FapiClient } from '../fapiClient';
import type { DevBrowserCookieOptions } from './cookies/devBrowser';
import { createDevBrowserCookie } from './cookies/devBrowser';

export interface DevBrowser {
  clear(): void;

  setup(): Promise<void>;

  getDevBrowser(): string | undefined;

  setDevBrowser(devBrowser: string): void;

  removeDevBrowser(): void;

  refreshCookies(): void;
}

export type CreateDevBrowserOptions = {
  frontendApi: string;
  cookieSuffix: string;
  fapiClient: FapiClient;
  cookieOptions: DevBrowserCookieOptions;
};

export function createDevBrowser({
  cookieSuffix,
  frontendApi,
  fapiClient,
  cookieOptions,
}: CreateDevBrowserOptions): DevBrowser {
  const devBrowserCookie = createDevBrowserCookie(cookieSuffix, cookieOptions);

  function getDevBrowser() {
    return devBrowserCookie.get();
  }

  function setDevBrowser(devBrowser: string) {
    devBrowserCookie.set(devBrowser);
  }

  function removeDevBrowser() {
    devBrowserCookie.remove();
  }

  function clear() {
    removeDevBrowser();
  }

  async function setup(): Promise<void> {
    if (!isDevOrStagingUrl(frontendApi)) {
      return;
    }

    // Set network interceptors to pass dev browser
    fapiClient.onBeforeRequest(request => {
      const devBrowser = getDevBrowser();
      if (devBrowser && request?.url) {
        request.url = setDevBrowserInURL(request.url, devBrowser);
      }
    });

    fapiClient.onAfterResponse((_, response) => {
      const newDevBrowser = response?.headers?.get(DEV_BROWSER_HEADER);
      if (newDevBrowser) {
        setDevBrowser(newDevBrowser);
      }
    });

    // 1. Get the dev browser from search parameters when the redirection comes from AP
    const devBrowserFromURL = extractDevBrowserFromURL(new URL(window.location.href));
    if (devBrowserFromURL) {
      setDevBrowser(devBrowserFromURL);
      return;
    }

    // 2. If no dev browser is found in the first step, check if one is already available in the __clerk_db_jwt JS cookie
    if (devBrowserCookie.get()) {
      return;
    }

    // 3. Otherwise, fetch a new dev browser from FAPI and set it in the __clerk_db_jwt JS cookie
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
    setDevBrowser(data?.id);
  }

  function refreshCookies() {
    const devBrowser = getDevBrowser();
    if (devBrowser) {
      setDevBrowser(devBrowser);
    }
  }

  return {
    clear,
    setup,
    getDevBrowser,
    setDevBrowser,
    removeDevBrowser,
    refreshCookies,
  };
}
