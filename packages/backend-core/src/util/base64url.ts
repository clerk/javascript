/**
 *
 * Parse a string to base64 URL encoding.
 *
 * https://github.com/swansontec/rfc4648.js
 * https://stackoverflow.com/questions/54062583/how-to-verify-a-signed-jwt-with-subtlecrypto-of-the-web-crypto-API
 *
 * @param {string} input
 * @return {Uint8Array} out
 */

interface Encoding {
  bits: number;
  chars: string;
  codes: { [char: string]: number };
}

export function parse(input: string): Uint8Array {
  const base64UrlEncoding: Encoding = {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
    bits: 6,
    codes: {},
  };

  // Build the character lookup table:
  for (let i = 0; i < base64UrlEncoding.chars.length; ++i) {
    base64UrlEncoding.codes[base64UrlEncoding.chars[i]] = i;
  }

  // Count the padding bytes:
  let end = input.length;
  while (input[end - 1] === '=') {
    --end;
  }

  // Allocate the output:
  const out = new Uint8Array(((end * base64UrlEncoding.bits) / 8) | 0);

  // Parse the data:
  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  let written = 0; // Next byte to write
  for (let i = 0; i < end; ++i) {
    // Read one character from the string:
    const value = base64UrlEncoding.codes[input[i]];
    if (value === undefined) {
      throw new Error('Invalid character ' + input[i]);
    }

    // Append the bits to the buffer:
    buffer = (buffer << base64UrlEncoding.bits) | value;
    bits += base64UrlEncoding.bits;

    // Write out some bits if the buffer has a byte's worth:
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 0xff & (buffer >> bits);
    }
  }

  // Verify that we have received just enough bits:
  if (bits >= base64UrlEncoding.bits || 0xff & (buffer << (8 - bits))) {
    throw new Error('Unexpected end of data');
  }

  return out;
}
