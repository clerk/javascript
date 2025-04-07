import browser from 'webextension-polyfill';

export type FormattedUrl = `http${string}`;

export type GetClientCookieParams = {
  name: string;
  url: string;
  callback: (changeInfo: ChangeInfo) => Promise<void>;
  onListenerCallback?: () => void;
};

export type ChangeInfo = {
  cookie: browser.Cookies.Cookie;
  cause: browser.Cookies.OnChangedCause;
  removed: boolean;
};

function ensureFormattedUrl(url: string): FormattedUrl {
  return url.startsWith('http') ? (url as FormattedUrl) : `https://${url}`;
}

export async function getClientCookie({ url, name }: GetClientCookieParams) {
  return await browser.cookies.get({ name, url: ensureFormattedUrl(url) });
}

export function createClientCookieListener({ url, name, callback }: GetClientCookieParams) {
  const domain = new URL(url).hostname;
  const cookieDomain = domain.startsWith('www.') ? domain.slice(4) : domain;

  const listener = (changeInfo: ChangeInfo) => {
    if (changeInfo.cookie.domain === cookieDomain && changeInfo.cookie.name === name) {
      void callback(changeInfo);
    }
  };

  return {
    add: () => browser.cookies.onChanged.addListener(listener),
    has: () => browser.cookies.onChanged.hasListener(listener),
    remove: () => browser.cookies.onChanged.removeListener(listener),
  };
}
