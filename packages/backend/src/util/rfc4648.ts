/**
 * The base64url helper was extracted from the rfc4648 package
 * in order to resolve CSJ/ESM interoperability issues
 *
 * https://github.com/swansontec/rfc4648.js
 *
 * For more context please refer to:
 * - https://github.com/evanw/esbuild/issues/1719
 * - https://github.com/evanw/esbuild/issues/532
 * - https://github.com/swansontec/rollup-plugin-mjs-entry
 */
export const base64url = {
  parse(string: string, opts?: ParseOptions): Uint8Array {
    return parse(string, base64UrlEncoding, opts);
  },

  stringify(data: ArrayLike<number>, opts?: StringifyOptions): string {
    return stringify(data, base64UrlEncoding, opts);
  },
};

const base64UrlEncoding: Encoding = {
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  bits: 6,
};

interface Encoding {
  bits: number;
  chars: string;
  codes?: { [char: string]: number };
}

interface ParseOptions {
  loose?: boolean;
  out?: new (size: number) => { [index: number]: number };
}

interface StringifyOptions {
  pad?: boolean;
}

function parse(string: string, encoding: Encoding, opts: ParseOptions = {}): Uint8Array {
  // Build the character lookup table:
  if (!encoding.codes) {
    encoding.codes = {};
    for (let i = 0; i < encoding.chars.length; ++i) {
      encoding.codes[encoding.chars[i]] = i;
    }
  }

  // The string must have a whole number of bytes:
  if (!opts.loose && (string.length * encoding.bits) & 7) {
    throw new SyntaxError('Invalid padding');
  }

  // Count the padding bytes:
  let end = string.length;
  while (string[end - 1] === '=') {
    --end;

    // If we get a whole number of bytes, there is too much padding:
    if (!opts.loose && !(((string.length - end) * encoding.bits) & 7)) {
      throw new SyntaxError('Invalid padding');
    }
  }

  // Allocate the output:
  const out = new (opts.out ?? Uint8Array)(((end * encoding.bits) / 8) | 0) as Uint8Array;

  // Parse the data:
  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  let written = 0; // Next byte to write
  for (let i = 0; i < end; ++i) {
    // Read one character from the string:
    const value = encoding.codes[string[i]];
    if (value === undefined) {
      throw new SyntaxError('Invalid character ' + string[i]);
    }

    // Append the bits to the buffer:
    buffer = (buffer << encoding.bits) | value;
    bits += encoding.bits;

    // Write out some bits if the buffer has a byte's worth:
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 0xff & (buffer >> bits);
    }
  }

  // Verify that we have received just enough bits:
  if (bits >= encoding.bits || 0xff & (buffer << (8 - bits))) {
    throw new SyntaxError('Unexpected end of data');
  }

  return out;
}

function stringify(data: ArrayLike<number>, encoding: Encoding, opts: StringifyOptions = {}): string {
  const { pad = true } = opts;
  const mask = (1 << encoding.bits) - 1;
  let out = '';

  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  for (let i = 0; i < data.length; ++i) {
    // Slurp data into the buffer:
    buffer = (buffer << 8) | (0xff & data[i]);
    bits += 8;

    // Write out as much as we can:
    while (bits > encoding.bits) {
      bits -= encoding.bits;
      out += encoding.chars[mask & (buffer >> bits)];
    }
  }

  // Partial character:
  if (bits) {
    out += encoding.chars[mask & (buffer << (encoding.bits - bits))];
  }

  // Add padding characters until we hit a byte boundary:
  if (pad) {
    while ((out.length * encoding.bits) & 7) {
      out += '=';
    }
  }

  return out;
}
