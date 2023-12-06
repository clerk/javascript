import browser from 'webextension-polyfill';

export async function getClientCookie(url: string, name: string) {
  return browser.cookies.get({ url, name });
}
