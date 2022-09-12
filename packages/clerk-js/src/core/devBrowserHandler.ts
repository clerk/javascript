import { buildURL, createCookieHandler, isDevOrStagingUrl, runIframe } from '../utils';
import { DEV_BROWSER_SSO_JWT_HTTP_HEADER, DEV_BROWSER_SSO_JWT_KEY, DEV_BROWSER_SSO_JWT_PARAMETER } from './constants';
import { clerkErrorDevInitFailed } from './errors';
import { FapiClient } from './fapiClient';

export interface DevBrowserHandler {
  clear(): Promise<void>;
  setup(): Promise<void>;
  getDevBrowserJWT(): string | null;
  setDevBrowserJWT(jwt: string): void;
  removeDevBrowserJWT(): void;
}

export type CreateDevBrowserHandlerOptions = {
  syncMode: 'cookies' | 'urlDecoration';
  frontendApi: string;
  fapiClient: FapiClient;
};

// export type DevBrowserHandler = ReturnType<typeof createDevBrowserHandler>;
export default function createDevBrowserHandler({
  frontendApi,
  fapiClient,
  syncMode,
}: CreateDevBrowserHandlerOptions): DevBrowserHandler {
  const cookieHandler = createCookieHandler();

  const localStorageKey =
    syncMode === 'urlDecoration' ? `${DEV_BROWSER_SSO_JWT_KEY}_${frontendApi}` : DEV_BROWSER_SSO_JWT_KEY;

  function getDevBrowserJWT() {
    return localStorage.getItem(localStorageKey);
  }

  function setDevBrowserJWT(jwt: string) {
    localStorage.setItem(localStorageKey, jwt);
  }

  function removeDevBrowserJWT() {
    localStorage.removeItem(localStorageKey);
  }

  async function clear() {
    removeDevBrowserJWT();
    await cookieHandler.removeAllDevBrowserCookies();
  }

  async function setup(): Promise<void> {
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

    if (syncMode === 'cookies') {
      await setupCookiesMode();
    } else if (syncMode === 'urlDecoration') {
      await setupUrlDecorationMode();
    }
  }

  async function setupUrlDecorationMode(): Promise<void> {
    console.log('Url decoration mode onload', window.location.hash);
    const flag = '&_clerk_test_jwt=';
    const hashParts = window.location.hash.split(flag);
    console.log('Url decoration mode onload', hashParts);
    if (hashParts.length === 2) {
      setDevBrowserJWT(hashParts[1]);
      const newURL = new URL(window.location.href);
      newURL.hash = hashParts[0];
      window.history.replaceState(window.history.state, '', newURL);
    } else if (hashParts.length === 1 && window.location.hash.startsWith(flag)) {
      setDevBrowserJWT(hashParts[0]);
      const newURL = new URL(window.location.href);
      newURL.hash = '';
      window.history.replaceState(window.history.state, '', newURL);
    }

    if (getDevBrowserJWT() !== null) {
      return;
    }

    const createDevBrowserUrl = fapiClient.buildUrl({
      method: 'POST',
      path: '/dev_browser',
    });

    const options: RequestInit = {
      method: 'POST',
    };

    const resp = await fetch(createDevBrowserUrl.toString(), options);

    const data = await resp.json();
    const token = data.token;
    setDevBrowserJWT(token);
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

  async function setupCookiesMode(): Promise<void> {
    const devOrStgApi = isDevOrStagingUrl(frontendApi);
    const devOrStgHost = isDevOrStagingUrl(window.location.host);

    if (devOrStgHost && !cookieHandler.getDevBrowserInittedCookie()) {
      return setFirstPartyCookieForDevBrowser();
    }

    if (!devOrStgHost && !getDevBrowserJWT()) {
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
