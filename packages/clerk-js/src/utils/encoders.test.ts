import { urlEncodeB64, urlDecodeB64 } from './encoders';

describe('base 64', () => {
  it('encodes and decodes a string', () => {
    expect(urlDecodeB64(urlEncodeB64('foo=42'))).toBe('foo=42');
  });
});
