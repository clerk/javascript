import browser from 'webextension-polyfill';

export type GetClientCookieParams = {
  urls: string | string[];
  name: string;
};

function isSingleHost(urls: string | string[]): urls is string {
  return typeof urls === 'string';
}

function ensureFormattedUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`;
}

export async function getClientCookie({ urls, name }: GetClientCookieParams) {
  // Handle single host request
  if (isSingleHost(urls)) {
    const url = ensureFormattedUrl(urls);
    return await browser.cookies.get({ url, name });
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
