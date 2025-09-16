import { describe, expect, it } from 'vitest';

import { urlDecodeB64, urlEncodeB64 } from '../encoders';

describe('base 64', () => {
  it('encodes and decodes a string', () => {
    expect(urlDecodeB64(urlEncodeB64('foo=42'))).toBe('foo=42');
  });
});
