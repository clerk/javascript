import { buildURL, createCookieHandler, getDevBrowserJWTFromURL, isDevOrStagingUrl, runIframe } from '../utils';
import { DEV_BROWSER_SSO_JWT_HTTP_HEADER, DEV_BROWSER_SSO_JWT_KEY, DEV_BROWSER_SSO_JWT_PARAMETER } from './constants';
import { clerkErrorDevInitFailed } from './errors';
import type { FapiClient } from './fapiClient';

export interface DevBrowserHandler {
  clear(): Promise<void>;

  setup(): Promise<void>;

  getDevBrowserJWT(): string | null;

  setDevBrowserJWT(jwt: string): void;

  removeDevBrowserJWT(): void;

  usesUrlBasedSessionSync(): boolean;
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
  const key = DEV_BROWSER_SSO_JWT_KEY;

  let usesUrlBasedSessionSyncing = true;

  function getDevBrowserJWT() {
    return localStorage.getItem(key);
  }

  function setDevBrowserJWT(jwt: string) {
    localStorage.setItem(key, jwt);
    // Append dev browser JWT to cookies, because server-side redirects (e.g. middleware) has no access to local storage
    cookieHandler.setDevBrowserCookie(jwt);
  }

  function removeDevBrowserJWT() {
    // TODO: Maybe clear keys for both dev session sync modes to be on the safe side?
    localStorage.removeItem(key);
    cookieHandler.removeDevBrowserCookie();
  }

  // location.host == *.[lcl.dev](http://lcl.dev)
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

  // location.host != *.[lcl.dev](http://lcl.dev)
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

  async function setUrlBasedSessionSyncBrowser(): Promise<void> {
    // 1. Get the JWT from hash search parameters when the redirection comes from Clerk Hosted Pages
    const devBrowserToken = getDevBrowserJWTFromURL(window.location.href);
    if (devBrowserToken) {
      setDevBrowserJWT(devBrowserToken);
      return;
    }

    // 2. If no JWT is found in the first step, check if a JWT is already available in the local cache
    if (getDevBrowserJWT() !== null) {
      return;
    }

    // 3. Otherwise, fetch a new DevBrowser JWT from FAPI and cache it
    const createDevBrowserUrl = fapiClient.buildUrl({
      path: '/dev_browser',
    });

    const resp = await fetch(createDevBrowserUrl.toString(), {
      method: 'POST',
    });

    if (resp.status === 200) {
      usesUrlBasedSessionSyncing = true;
      const data = await resp.json();
      setDevBrowserJWT(data?.token);
    } else {
      usesUrlBasedSessionSyncing = false;
    }
  }

  async function clear() {
    removeDevBrowserJWT();
    cookieHandler.removeAllDevBrowserCookies();
    return Promise.resolve();
  }

  function usesUrlBasedSessionSync(): boolean {
    return usesUrlBasedSessionSyncing;
  }

  async function setup(): Promise<void> {
    const devOrStgApi = isDevOrStagingUrl(frontendApi);
    const devOrStgHost = isDevOrStagingUrl(window.location.host);

    if (devOrStgApi) {
      fapiClient.onBeforeRequest(request => {
        const devBrowserJWT = getDevBrowserJWT();
        if (devBrowserJWT) {
          request.url?.searchParams.set(DEV_BROWSER_SSO_JWT_PARAMETER, devBrowserJWT);
        }
      });

      fapiClient.onAfterResponse((_, response) => {
        const newDevBrowserJWT = response?.headers?.get(DEV_BROWSER_SSO_JWT_HTTP_HEADER);
        if (newDevBrowserJWT) {
          setDevBrowserJWT(newDevBrowserJWT);
        }
      });
    }

    await setUrlBasedSessionSyncBrowser();

    if (usesUrlBasedSessionSync()) {
      return;
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
    usesUrlBasedSessionSync,
    removeDevBrowserJWT,
  };
}
