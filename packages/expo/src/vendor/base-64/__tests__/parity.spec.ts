/**
 * Vendor parity test for base-64@1.0.0.
 *
 * Loads encode/decode from BOTH the upstream npm package (kept in
 * @clerk/expo devDependencies for as long as this test exists) AND the
 * vendored copy at ../upstream/base64.js. Asserts byte-equivalent inputs
 * produce identical outputs.
 *
 * What this test buys:
 *   - The byte-equivalence check (tools/verify-vendor.sh) proves the bytes
 *     on disk match the upstream tarball.
 *   - This test proves that loading those bytes through our bundler /
 *     test runtime produces upstream's behavior — closing the gap between
 *     "the bytes are correct" and "the runtime does what upstream does."
 *
 * When to remove this test:
 *   - When the upstream `base-64` devDependency is removed from
 *     packages/expo/package.json, this file must be removed too (the
 *     `from 'base-64'` import would fail to resolve). Removing the devDep
 *     means losing the comparator; don't do that unless the vendoring
 *     approach is fully accepted.
 *
 * See packages/expo/src/vendor/base-64/README.md for the broader vendoring
 * rationale and the customer-side attack chains that motivate it.
 */

// eslint-disable-next-line no-restricted-imports -- intentional: comparator for vendor parity
import { decode as upstreamDecode, encode as upstreamEncode } from 'base-64';
import { describe, expect, it } from 'vitest';

import { decode as vendoredDecode, encode as vendoredEncode } from '../';

/**
 * RFC 4648 §10 test vectors — canonical base64 fixtures from the spec.
 * Every base64 implementation should handle these identically.
 */
const RFC4648_VECTORS: Array<[plain: string, encoded: string]> = [
  ['', ''],
  ['f', 'Zg=='],
  ['fo', 'Zm8='],
  ['foo', 'Zm9v'],
  ['foob', 'Zm9vYg=='],
  ['fooba', 'Zm9vYmE='],
  ['foobar', 'Zm9vYmFy'],
];

/**
 * Cases beyond the RFC vectors — the polyfill use case is hijacking
 * global.btoa / global.atob, so the parity surface must cover everything
 * an arbitrary caller (third-party library) might throw at it.
 */
const EXTRA_VECTORS: Array<[label: string, plain: string]> = [
  ['empty', ''],
  ['single null byte', '\x00'],
  ['Latin-1 high', '\xff'],
  ['arbitrary binary', '\x00\x01\x02\x03\x04\xfd\xfe\xff'],
  ['ASCII letters', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'],
  ['ASCII symbols', '!@#$%^&*()_+-=[]{}|;:,.<>?/~`\'"\\'],
  ['long string', 'a'.repeat(1024)],
  ['exactly 3 bytes', 'abc'],
  ['exactly 4 bytes (forces padding=)', 'abcd'],
  ['exactly 6 bytes (no padding)', 'abcdef'],
  ['JSON shape', '{"foo":"bar","baz":[1,2,3]}'],
];

describe('base-64 vendor parity — RFC 4648 fixtures', () => {
  it.each(RFC4648_VECTORS)('encode(%j) === %j', (plain, encoded) => {
    expect(vendoredEncode(plain)).toBe(upstreamEncode(plain));
    expect(vendoredEncode(plain)).toBe(encoded); // canonical anchor
  });

  it.each(RFC4648_VECTORS)('decode(%j) === %j', (plain, encoded) => {
    expect(vendoredDecode(encoded)).toBe(upstreamDecode(encoded));
    expect(vendoredDecode(encoded)).toBe(plain); // canonical anchor
  });
});

describe('base-64 vendor parity — extra fixtures', () => {
  it.each(EXTRA_VECTORS)('encode/decode roundtrip: %s', (_label, plain) => {
    const vEnc = vendoredEncode(plain);
    const uEnc = upstreamEncode(plain);
    expect(vEnc).toBe(uEnc);
    expect(vendoredDecode(vEnc)).toBe(upstreamDecode(uEnc));
    expect(vendoredDecode(vEnc)).toBe(plain);
  });
});

describe('base-64 vendor parity — deterministic fuzz', () => {
  it('matches upstream for 512 random binary strings of varying length', () => {
    for (let seed = 0; seed < 512; seed++) {
      const len = (seed * 37) % 256;
      const chars: string[] = [];
      for (let i = 0; i < len; i++) {
        // Latin-1 range only (0-255) — what base-64 contracts on.
        chars.push(String.fromCharCode((seed + i * 13) & 0xff));
      }
      const plain = chars.join('');
      const vEnc = vendoredEncode(plain);
      const uEnc = upstreamEncode(plain);
      expect(vEnc, `seed=${seed}`).toBe(uEnc);
      expect(vendoredDecode(vEnc), `seed=${seed}`).toBe(upstreamDecode(uEnc));
    }
  });
});

describe('base-64 vendor parity — error handling', () => {
  // Both upstream and vendored should throw on invalid input. We don't pin
  // the error message, just that they agree on which inputs throw.
  const INVALID: Array<[label: string, invalid: string]> = [
    ['truncated padding', 'Zm9'],
    ['invalid char', 'Zm$9v'],
    ['stray padding', 'Zm9v='],
  ];
  it.each(INVALID)('decode throws-or-matches on invalid input: %s', (_label, invalid) => {
    let vErr: unknown = null;
    let uErr: unknown = null;
    let vResult: string | null = null;
    let uResult: string | null = null;
    try {
      vResult = vendoredDecode(invalid);
    } catch (e) {
      vErr = e;
    }
    try {
      uResult = upstreamDecode(invalid);
    } catch (e) {
      uErr = e;
    }
    // Either both threw or both produced the same output.
    expect(Boolean(vErr)).toBe(Boolean(uErr));
    if (!vErr) {
      expect(vResult).toBe(uResult);
    }
  });
});
