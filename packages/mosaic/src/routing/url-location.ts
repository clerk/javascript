import { logger } from '@clerk/shared/logger';

import { normalizeBase } from './base-path';
import type { SegmentParts } from './location';
import { decodeSegment, encodeSegment, paramKey, readParam, writeParam } from './url-params';
import type { HostUrl } from './window-location';

export type UrlRoutingMode = 'path' | 'hash' | 'query';

// Where a URL mode keeps a base's segment: the part of the URL it lives in, how to find the
// segment there, how to put one back, and how the segment and the parts map onto each other in that
// field. The pathname is split before it is decoded; a param's value is read as a param first and
// then as a segment, so its parts are encoded twice. `refuse` names why parts cannot go into this
// field.
export interface UrlCarrier {
  field: keyof HostUrl;
  read: (value: string) => string | undefined;
  write: (value: string, segment: string) => string;
  clear: (value: string) => string;
  decode: (segment: string) => SegmentParts;
  encode: (parts: SegmentParts) => string;
  refuse?: (parts: SegmentParts) => string | undefined;
}

function decodePart(part: string): string {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

const isDotPart = (part: string) => part === '.' || part === '..';

// The pathname under the base: '/user/billing/st_1' -> 'billing/st_1' under '/user', and a pathname
// outside the base has no entry. The base is compared part by part on the decoded form, because
// browsers and host routers leave different characters raw in a pathname; the segment itself is
// handed on raw. One trailing slash is the same pathname, as a host with trailing slashes on has it.
// A pathname always says something, so clearing goes to the base.
function pathCarrier(basePath: string): UrlCarrier {
  const base = normalizeBase(basePath);
  const prefix = base === '' ? [] : base.slice(1).split('/').map(decodePart);
  if (prefix.some(isDotPart) || /[?#]/.test(base)) {
    logger.warnOnce(
      `[Clerk] "${basePath}" cannot be routed under in the pathname: a "?" or "#", or a part that is "." or "..", does not survive a URL. Nothing written under it will come back.`,
    );
  }
  const write = (_pathname: string, segment: string) => (segment === '' ? base || '/' : `${base}/${segment}`);
  return {
    field: 'pathname',
    read: pathname => {
      const parts = pathname === '/' ? [] : pathname.slice(1).split('/');
      if (parts.length > 0 && parts[parts.length - 1] === '') {
        parts.pop();
      }
      if (parts.length < prefix.length || prefix.some((part, index) => decodePart(parts[index] ?? '') !== part)) {
        return undefined;
      }
      return parts.slice(prefix.length).join('/');
    },
    write,
    clear: pathname => write(pathname, ''),
    decode: decodeSegment,
    encode: encodeSegment,
    refuse: parts => {
      if (parts.some(isDotPart)) {
        return `[Clerk] "${parts.join('/')}" was not navigated to: a part that is "." or ".." resolves away in a pathname.`;
      }
      if (parts.includes('')) {
        return `[Clerk] "${parts.join('/')}" was not navigated to: an empty part reads back as a doubled or trailing slash in a pathname.`;
      }
      return undefined;
    },
  };
}

// One pair of the query string or the hash, `.user=billing%2Fst_1`.
function paramCarrier(field: 'search' | 'hash', key: string): UrlCarrier {
  if (key === '') {
    logger.warnOnce(
      `[Clerk] ${field === 'hash' ? 'Hash' : 'Query'} routing with an empty key prefix needs a "path" other than "/" or a key prefix, or its param has no name.`,
    );
  }
  return {
    field,
    read: body => readParam(body, key),
    write: (body, segment) => writeParam(body, key, segment),
    clear: body => writeParam(body, key, undefined),
    decode: decodeSegment,
    encode: encodeSegment,
    refuse: parts =>
      parts.includes('')
        ? `[Clerk] "${parts.join('/')}" was not navigated to: an empty part reads back as no part at all.`
        : undefined,
  };
}

export interface KeyPrefixes {
  query: string;
  hash: string;
}

export function urlCarrier(mode: UrlRoutingMode, basePath: string, prefixes: KeyPrefixes): UrlCarrier {
  switch (mode) {
    case 'path':
      return pathCarrier(basePath);
    case 'query':
      return paramCarrier('search', paramKey(prefixes.query, basePath));
    case 'hash':
      return paramCarrier('hash', paramKey(prefixes.hash, basePath));
  }
}

export function urlOf({ pathname, search, hash }: HostUrl): string {
  return `${pathname}${search === '' ? '' : `?${search}`}${hash === '' ? '' : `#${hash}`}`;
}

// The URL with the parts written under the carrier's base, everything outside the segment as it
// was, or nothing when the carrier cannot hold them.
export function urlWith(carrier: UrlCarrier, url: HostUrl, parts: SegmentParts): string | undefined {
  const refused = carrier.refuse?.(parts);
  if (refused !== undefined) {
    logger.warnOnce(refused);
    return undefined;
  }
  return urlOf({ ...url, [carrier.field]: carrier.write(url[carrier.field], carrier.encode(parts)) });
}

export function urlWithout(carrier: UrlCarrier, url: HostUrl): string {
  return urlOf({ ...url, [carrier.field]: carrier.clear(url[carrier.field]) });
}
