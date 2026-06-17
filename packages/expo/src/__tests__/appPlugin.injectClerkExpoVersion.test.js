import { describe, expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS plugin, no ESM export
const { injectClerkExpoVersion } = require('../../app.plugin.js')._testing;

describe('injectClerkExpoVersion', () => {
  test('replaces every Swift bridge version placeholder with the package version', () => {
    expect(
      injectClerkExpoVersion(
        [
          'request.addValue("__CLERK_EXPO_VERSION__", forHTTPHeaderField: "x-clerk-host-sdk-version")',
          'let version = "__CLERK_EXPO_VERSION__"',
        ].join('\n'),
        '3.4.3',
      ),
    ).toBe(
      ['request.addValue("3.4.3", forHTTPHeaderField: "x-clerk-host-sdk-version")', 'let version = "3.4.3"'].join('\n'),
    );
  });
});
