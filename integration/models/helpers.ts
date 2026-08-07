import { randomBytes } from 'node:crypto';
import type { Readable } from 'node:stream';

// @ts-nocheck
const raw = (val: any) => dedent(String.raw(val));
const js = raw;
const jsx = raw;
const ts = raw;
const tsx = raw;
const mdx = raw;
const css = raw;

function json(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2);
}

export const helpers = {
  js,
  jsx,
  ts,
  tsx,
  mdx,
  css,
  json,
} as const;

export type Helpers = typeof helpers;

/**
 * Format a String.raw template string with indentation stripped.
 * https://github.com/dmnd/dedent/blob/master/dedent.js
 */
const dedent = (strings: string | Array<string>, ...values: Array<string>) => {
  // @ts-ignore
  const raw = typeof strings === 'string' ? [strings] : strings.raw;

  let result = '';
  for (let i = 0; i < raw.length; i++) {
    result += raw[i].replace(/\\\n[ \t]*/g, '').replace(/\\`/g, '`');

    if (i < values.length) {
      result += values[i];
    }
  }

  const lines = result.split('\n');
  let mindent: number | null = null;
  lines.forEach(l => {
    const m = l.match(/^(\s+)\S+/);
    if (m) {
      const indent = m[1].length;
      if (!mindent) {
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  if (mindent !== null) {
    const m = mindent; // appease Flow
    result = lines.map(l => (l[0] === ' ' || l[0] === '\t' ? l.slice(m) : l)).join('\n');
  }

  return result.trim().replace(/\\n/g, '\n');
};

export const hash = () => randomBytes(5).toString('hex');

/**
 * Generates a strong, unique password for fake test users.
 *
 * Avoids any pattern derived from the user's email or other guessable inputs,
 * so it doesn't collide with HIBP / compromised-password lists that would
 * cause FAPI to reject sign-in with `form_password_compromised` (HTTP 422).
 *
 * Includes upper, lower, digit, and symbol to satisfy default Clerk password
 * complexity rules.
 */
export const fakerPassword = () => {
  const bytes = randomBytes(18).toString('base64url');
  return `Aa1!${bytes}`;
};

export const waitUntilMessage = async (stream: Readable, message: string) => {
  return new Promise<void>(resolve => {
    stream.on('data', chunk => {
      if (chunk.toString().includes(message)) {
        resolve();
      }
    });
  });
};
