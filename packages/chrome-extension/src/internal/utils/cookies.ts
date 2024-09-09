import browser from 'webextension-polyfill';

export type FormattedUrl = `http${string}`;
export type GetClientCookieParams = {
  name: string;
  url: string;
};

function ensureFormattedUrl(url: string): FormattedUrl {
  return url.startsWith('http') ? (url as FormattedUrl) : `https://${url}`;
}

export async function getClientCookie({ url, name }: GetClientCookieParams) {
  return await browser.cookies.get({ name, url: ensureFormattedUrl(url) });
}
