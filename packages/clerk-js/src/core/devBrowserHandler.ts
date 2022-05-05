import { buildURL, createCookieHandler, isDevOrStagingUrl, runIframe } from 'utils';

import { DEV_BROWSER_SSO_JWT_HTTP_HEADER, DEV_BROWSER_SSO_JWT_KEY, DEV_BROWSER_SSO_JWT_PARAMETER } from './constants';
import { clerkErrorDevInitFailed } from './errors';
import { FapiClient } from './fapiClient';

export interface DevBrowserHandler {
  clear(): Promise<void>;
  setup({ purge }: { purge: boolean }): Promise<void>;
  getDevBrowserJWT(): string | null;
  setDevBrowserJWT(jwt: string): void;
  removeDevBrowserJWT(): void;
}

export type CreateDevBrowserHandlerOptions = {
  frontendApi: string;
  fapiClient: FapiClient;
};

// export type DevBrowserHandler = ReturnType<typeof createDevBrowserHandler>;
export default function createDevBrowserHandler({
  frontendApi,
  fapiClient,
}: CreateDevBrowserHandlerOptions): DevBrowserHandler {
  const cookieHandler = createCookieHandler();
  function getDevBrowserJWT() {
    return localStorage.getItem(DEV_BROWSER_SSO_JWT_KEY);
  }

  function setDevBrowserJWT(jwt: string) {
    localStorage.setItem(DEV_BROWSER_SSO_JWT_KEY, jwt);
  }

  function removeDevBrowserJWT() {
    localStorage.removeItem(DEV_BROWSER_SSO_JWT_KEY);
  }

  // location.host == *.lcl.dev
  async function setFirstPartyCookieForDevBrowser(): Promise<void> {
    const setFirstPartyCookieUrl = fapiClient.buildUrl({
      method: 'POST',
      path: '/dev_browser/set_first_party_cookie',
    });

    const options: RequestInit = {
      method: 'POST',
      credentials: 'include',
    };
    const resp = await fetch(setFirstPartyCookieUrl.toString(), options);

    if (!resp.ok) {
      clerkErrorDevInitFailed();
    }

    cookieHandler.setDevBrowserInittedCookie();
  }

  // location.host != *.lcl.dev
  async function setThirdPartyCookieForDevBrowser(): Promise<void> {
    const fapiOrigin = `https://${frontendApi}`;
    const origin = window.location.origin;
    const redirect = window.location.href;
    const src = buildURL(
      {
        base: fapiOrigin,
        pathname: '/v1/dev_browser/init',
        search: `origin=${origin}&redirect=${redirect}`,
      },
      {
        stringify: true,
      },
    );

    try {
      const { browserToken } = await runIframe<{ browserToken: string }>({
        src,
        eventOrigin: fapiOrigin,
      });

      if (!browserToken) {
        throw 'Missing token';
      }

      setDevBrowserJWT(browserToken);
      cookieHandler.removeSessionCookie();
    } catch (err) {
      clerkErrorDevInitFailed(err.message || err);
    }
  }

  async function clear() {
    removeDevBrowserJWT();
    await cookieHandler.removeAllDevBrowserCookies();
  }

  async function setup({ purge }: { purge: boolean }): Promise<void> {
    const devOrStgApi = isDevOrStagingUrl(frontendApi);
    const devOrStgHost = isDevOrStagingUrl(window.location.host);

    if (purge) {
      // Note 1: When setup runs for production instances, clear will work only in staging and production Clerk environments
      // as lclclerk.com is not in the PSL yet.  As a result we can't delete the .(prod|dev).lclclerk.com cookie
      // that is set from auth V1 applications in local environment
      await clear();
    }

    if (devOrStgApi) {
      fapiClient.onBeforeRequest(request => {
        const devBrowserJWT = getDevBrowserJWT();
        if (devBrowserJWT) {
          request.url?.searchParams.set(DEV_BROWSER_SSO_JWT_PARAMETER, devBrowserJWT);
        }
      });

      fapiClient.onAfterResponse((_, response) => {
        const newDevBrowserJWT = response?.headers.get(DEV_BROWSER_SSO_JWT_HTTP_HEADER);
        if (newDevBrowserJWT) {
          setDevBrowserJWT(newDevBrowserJWT);
        }
      });
    }

    if (devOrStgHost && !cookieHandler.getDevBrowserInittedCookie()) {
      return setFirstPartyCookieForDevBrowser();
    }

    if (!devOrStgHost && devOrStgApi && !getDevBrowserJWT()) {
      return setThirdPartyCookieForDevBrowser();
    }
  }

  return {
    clear,
    setup,
    getDevBrowserJWT,
    setDevBrowserJWT,
    removeDevBrowserJWT,
  };
}
