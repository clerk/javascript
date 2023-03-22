export function convertPublishableKeyToFrontendAPIOrigin(key = '') {
  return `https://${atob(key.replace(/pk_(test|live)_/, '')).slice(0, -1)}`;
}

export async function getClientCookie(url: string) {
  return chrome.cookies.get({ url, name: '__client' });
}

export function setInStorage(key: string, value: string) {
  return chrome.storage.local.set({ [key]: value });
}

export function getFromStorage(key: string) {
  return chrome.storage.local.get(key).then(result => {
    return result[key];
  });
}
