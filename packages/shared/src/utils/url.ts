const DUMMY_URL_BASE = 'http://clerk-dummy';

export function parseSearchParams(queryString = ''): URLSearchParams {
  if (queryString.startsWith('?')) {
    queryString = queryString.slice(1);
  }
  return new URLSearchParams(queryString);
}

export function stripScheme(url = ''): string {
  return (url || '').replace(/^.+:\/\//, '');
}

export function addClerkPrefix(str: string | undefined) {
  if (!str) {
    return '';
  }
  let regex;
  if (str.match(/^(clerk\.)+\w*$/)) {
    regex = /(clerk\.)*(?=clerk\.)/;
  } else if (str.match(/\.clerk.accounts/)) {
    return str;
  } else {
    regex = /^(clerk\.)*/gi;
  }

  const stripped = str.replace(regex, '');
  return `clerk.${stripped}`;
}

export function isRelativeUrl(str: string) {
  const url = new URL(str, DUMMY_URL_BASE);

  return url.origin === DUMMY_URL_BASE;
}

export function isCrossOrigin(str1: string, str2: string) {
  const base = typeof window === undefined ? DUMMY_URL_BASE : window.location.origin;

  const url1 = new URL(str1, base);
  const url2 = new URL(str2, base);

  return url1.origin !== url2.origin;
}
