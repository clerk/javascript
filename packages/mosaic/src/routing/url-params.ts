import { normalizeBase } from './base-path';
import type { SegmentParts } from './location';

// Parts as text: encoded one by one and joined with `/`. The split happens on the encoded form, so
// an encoded slash stays inside its part, and each part is decoded exactly once. The URL is anyone's
// to write, so a malformed escape reads as no parts rather than throwing.
export function encodeParts(parts: SegmentParts): string {
  return parts.map(encodeURIComponent).join('/');
}

export function decodeParts(raw: string): SegmentParts {
  if (raw === '') {
    return [];
  }
  try {
    return raw.split('/').map(decodeURIComponent);
  } catch {
    return [];
  }
}

// ('', '/modal/user') -> '.modal.user'    ('clerk', '/user') -> 'clerk.user'
export function paramKey(prefix: string, base: string): string {
  return prefix + normalizeBase(base).replaceAll('/', '.');
}

// The query string and the hash spell a segment as one pair, `.user=security&.modal.user=`, read
// and written as URLSearchParams, so every pair comes out in its canonical spelling and the parts
// are encoded twice: once as parts text, once by the param.
export function readParam(body: string, key: string): string | undefined {
  return new URLSearchParams(body).get(key) ?? undefined;
}

export function writeParam(body: string, key: string, value: string | undefined): string {
  const params = new URLSearchParams(body);
  if (value === undefined) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  return params.toString();
}
