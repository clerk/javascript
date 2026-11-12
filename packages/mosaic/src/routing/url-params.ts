import { normalizeBase } from './base-path';
import type { SegmentParts } from './location';

// The pathname's segment: parts encoded one by one and joined with `/`. The split happens on the
// encoded form, so an encoded slash stays inside its part, and each part is decoded exactly once.
// The URL is anyone's to write, so a malformed escape reads as no parts rather than throwing.
export function encodeSegment(parts: SegmentParts): string {
  return parts.map(encodeURIComponent).join('/');
}

export function decodeSegment(raw: string): SegmentParts {
  if (raw === '') {
    return [];
  }
  try {
    return raw.split('/').map(decodeURIComponent);
  } catch {
    return [];
  }
}

// A param's value is the host's: a host router may re-serialise its query string, so the value is
// read decoded and split as it is. A part in a param therefore cannot contain a slash.
export function splitParamValue(value: string): SegmentParts {
  return value === '' ? [] : value.split('/');
}

// ('p.', '/modal/user') -> 'p.modal.user'
export function paramKey(prefix: string, base: string): string {
  return prefix + normalizeBase(base).slice(1).replaceAll('/', '.');
}

// The query string and the hash keep one pair per base, `p.user=security&p.modal.user=`. A pair is
// read the way any param is, decoded; it is written on the raw form, so a pair that is not ours is
// kept byte for byte and only our own value is ever re-encoded.
function pairsOf(body: string): string[] {
  return body === '' ? [] : body.split('&');
}

function decodeEscapes(escapes: string): string {
  try {
    return decodeURIComponent(escapes);
  } catch {
    return escapes;
  }
}

function decodeKeyOf(pair: string): string {
  const at = pair.indexOf('=');
  const raw = at === -1 ? pair : pair.slice(0, at);
  return raw.replaceAll('+', ' ').replace(/(?:%[0-9a-f]{2})+/gi, decodeEscapes);
}

// ('a=1&p.user=billing/st%201', 'p.user') -> 'billing/st 1'    no pair -> undefined
export function readParam(body: string, key: string): string | undefined {
  return new URLSearchParams(body).get(key) ?? undefined;
}

// ('a=1&p.user=x', 'p.user', 'security') -> 'a=1&p.user=security'    value undefined -> 'a=1'
// The pair keeps its place; a new one goes last.
export function writeParam(body: string, key: string, value: string | undefined): string {
  const encodedKey = encodeURIComponent(key);
  let pending = value === undefined ? undefined : `${encodedKey}=${value}`;
  const next: string[] = [];
  for (const pair of pairsOf(body)) {
    if (pair === '' || decodeKeyOf(pair) !== key) {
      next.push(pair);
    } else if (pending !== undefined) {
      next.push(pending);
      pending = undefined;
    }
  }
  if (pending !== undefined) {
    next.push(pending);
  }
  return next.join('&');
}
