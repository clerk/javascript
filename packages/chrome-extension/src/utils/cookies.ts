import browser from 'webextension-polyfill';

export type GetClientCookieParams = {
  urls: string | string[];
  name: string;
};

export async function getClientCookie({ urls, name }: GetClientCookieParams) {
  // Handle single host request
  if (typeof urls === 'string') {
    return browser.cookies.get({ url: urls, name });
  }

  // Handle multi-host request
  const cookiePromises = urls.map(url => browser.cookies.get({ url, name }));
  const cookieResults = await Promise.allSettled(cookiePromises);

  for (const cookie of cookieResults) {
    if (cookie.status === 'fulfilled') {
      return cookie.value;
    }
  }

  return null;
}
