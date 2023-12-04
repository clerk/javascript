export async function getClientCookie(url: string) {
  return chrome.cookies.get({ url, name: '__client' });
}
