import { logger } from '@clerk/shared/logger';

import { normalizeBase } from './base-path';
import type { SegmentParts } from './location';
import { decodeParts, encodeParts, paramKey, readParam, writeParam } from './url-params';
import type { HostUrl } from './window-location';

export type UrlRoutingMode = 'path' | 'hash' | 'query';

// A codec for how to read and write a specific segment to the url
// This gets created and works differently per routing mode and the field
// holds 'pathname', 'search' or 'hash', so it can be used to pluck the
// correct value from a Url.
export interface SegmentCodec {
  field: keyof HostUrl;
  read: (value: string) => string | undefined;
  write: (value: string, encoded: string) => string;
  clear: (value: string) => string;
  decode: (encoded: string) => SegmentParts;
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

function createPathCodec(basePath: string): SegmentCodec {
  const base = normalizeBase(basePath);
  const prefix = base === '' ? [] : base.slice(1).split('/').map(decodePart);
  if (prefix.some(isDotPart) || /[?#]/.test(base)) {
    logger.warnOnce(
      `[Clerk] "${basePath}" cannot be routed under in the pathname: a "?" or "#", or a part that is "." or "..", does not survive a URL. Nothing written under it will come back.`,
    );
  }
  const write = (_pathname: string, encoded: string) => (encoded === '' ? base || '/' : `${base}/${encoded}`);
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
    decode: decodeParts,
    encode: encodeParts,
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

function createParamCodec(field: 'search' | 'hash', key: string): SegmentCodec {
  if (key === '') {
    logger.warnOnce(
      `[Clerk] ${field === 'hash' ? 'Hash' : 'Query'} routing with an empty key prefix needs a "path" other than "/" or a key prefix, or its param has no name.`,
    );
  }
  return {
    field,
    read: body => readParam(body, key),
    write: (body, encoded) => writeParam(body, key, encoded),
    clear: body => writeParam(body, key, undefined),
    decode: decodeParts,
    encode: encodeParts,
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

export function createSegmentCodec(mode: UrlRoutingMode, basePath: string, prefixes: KeyPrefixes): SegmentCodec {
  switch (mode) {
    case 'path':
      return createPathCodec(basePath);
    case 'query':
      return createParamCodec('search', paramKey(prefixes.query, basePath));
    case 'hash':
      return createParamCodec('hash', paramKey(prefixes.hash, basePath));
  }
}

export function urlOf({ pathname, search, hash }: HostUrl): string {
  return `${pathname}${search === '' ? '' : `?${search}`}${hash === '' ? '' : `#${hash}`}`;
}

// The URL with the parts written under the codec's base, everything outside the segment as it was
export function urlWith(codec: SegmentCodec, url: HostUrl, parts: SegmentParts): string | undefined {
  const refused = codec.refuse?.(parts);
  if (refused !== undefined) {
    logger.warnOnce(refused);
    return undefined;
  }
  return urlOf({ ...url, [codec.field]: codec.write(url[codec.field], codec.encode(parts)) });
}

export function urlWithout(codec: SegmentCodec, url: HostUrl): string {
  return urlOf({ ...url, [codec.field]: codec.clear(url[codec.field]) });
}
