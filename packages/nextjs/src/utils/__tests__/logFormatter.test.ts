import { describe, expect, it } from 'vitest';

import { logFormatter } from '../logFormatter';

describe('logFormatter', () => {
  it('truncates sensitive token keys nested in debug objects', () => {
    const entry = [
      'auth',
      {
        auth: { userId: 'user_123' },
        debug: {
          sessionToken: 'eyJhbGciOiJSUzI1NiJ9.payload.full-session-segment-should-not-appear',
          tokenInHeader: 'eyJhbGciOiJSUzI1NiJ9.payload.header-segment-should-not-appear',
          sessionTokenInCookie: 'eyJhbGciOiJSUzI1NiJ9.payload.cookie-segment-should-not-appear',
        },
      },
    ];

    const output = logFormatter(entry as any);

    // Full bearer tokens nested under known keys must not survive formatting.
    expect(output).not.toContain('full-session-segment-should-not-appear');
    expect(output).not.toContain('header-segment-should-not-appear');
    expect(output).not.toContain('cookie-segment-should-not-appear');
    // Only the short, non-reconstructable prefix remains.
    expect(output).toContain('"sessionToken": "eyJhbGc"');
    // Non-sensitive nested data is preserved.
    expect(output).toContain('"userId": "user_123"');
  });

  it('is idempotent for values already truncated at the source', () => {
    const entry = ['auth', { debug: { sessionToken: 'eyJhbGc' } }];

    const output = logFormatter(entry as any);

    expect(output).toContain('"sessionToken": "eyJhbGc"');
  });
});
