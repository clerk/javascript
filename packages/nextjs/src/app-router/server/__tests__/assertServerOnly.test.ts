import { describe, expect, it } from 'vitest';

import { assertServerOnly } from '../assertServerOnly';

describe('assertServerOnly', () => {
  it('calls require("server-only") when require is available', () => {
    // In Node/test environment, require exists and server-only throws
    // because we're not in a React Server Component context.
    // This proves the guard allows the require call through.
    expect(() => assertServerOnly()).toThrow();
  });

  // The pure ESM path (typeof require !== 'function') cannot be tested in Node.js
  // because require is a module-level binding. This path is validated by the
  // vinext/Cloudflare Workers smoke test where require truly doesn't exist.
});
