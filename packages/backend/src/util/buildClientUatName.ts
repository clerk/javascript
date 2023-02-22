import { requestProxyUrlToAbsoluteURL } from '@clerk/shared';

import { convertToSHA1 } from './convertToSHA1';

export type buildCookieNameOptions = {
  publishableKey: string;
  domain?: string;
  proxyUrl?: string;
  isSatellite?: boolean;
};

export async function buildClientUatName({ options, url }: { options: buildCookieNameOptions; url: string }) {
  const { publishableKey = '', domain = '', proxyUrl = '', isSatellite = false } = options;
  const keyArray = [] as string[];

  if (publishableKey) {
    keyArray.push(publishableKey);
  }

  if (isSatellite && domain) {
    keyArray.push(domain);
  }

  if (proxyUrl) {
    keyArray.push(requestProxyUrlToAbsoluteURL(proxyUrl, new URL(url).origin));
  }

  const stringValue = keyArray.join('-');

  const encoder = new TextEncoder();
  const toUint8 = encoder.encode(stringValue);

  // eslint-disable-next-line @typescript-eslint/await-thenable
  const result = await convertToSHA1(toUint8);
  return `__client_uat_${result.slice(0, 12)}`;
}
