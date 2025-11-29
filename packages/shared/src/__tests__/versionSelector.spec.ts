/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it, test } from 'vitest';

import { versionSelector } from '../versionSelector';

describe('versionSelector', () => {
  it('should return the clerkJSVersion if it is provided', () => {
    expect(versionSelector('1.0.0')).toEqual('1.0.0');
  });

  it('should use the major version if there is no prerelease tag', () => {
    const PACKAGE_VERSION = '1.0.0';
    // @ts-ignore
    global.JS_PACKAGE_VERSION = '2.0.0';

    expect(versionSelector(undefined, PACKAGE_VERSION)).toEqual('1');
  });

  it('should use the prerelease tag when it is not snapshot', () => {
    const PACKAGE_VERSION = '1.0.0-next.0';
    // @ts-ignore
    global.JS_PACKAGE_VERSION = '2.0.0-next.0';

    expect(versionSelector(undefined, PACKAGE_VERSION)).toEqual('next');
  });

  it('should use the exact JS version if tag is snapshot', () => {
    const PACKAGE_VERSION = '1.0.0-snapshot.0';
    // @ts-ignore
    global.JS_PACKAGE_VERSION = '2.0.0-snapshot.0';

    expect(versionSelector(undefined, PACKAGE_VERSION)).toEqual('2.0.0-snapshot.0');
  });

  // We replaced semver with 2 custom regexes
  // so we're testing the same cases as semver tests
  // https://github.com/npm/node-semver/blob/main/test/functions/prerelease.js
  // https://github.com/npm/node-semver/blob/main/test/functions/major.js
  test.each([
    ['1.2.3', 1],
    [' 1.2.3 ', 1],
    [' 2.2.3-4 ', 4],
    [' 3.2.3-pre ', 'pre'],
    ['v5.2.3', 5],
    [' v8.2.3 ', 8],
    ['\t13.2.3', 13],
    ['1.2.2-alpha.1', 'alpha'],
    ['1.2.2-beta.1', 'beta'],
    ['1.2.2-rc.1', 'rc'],
    ['1.2.2', 1],
    ['1.2.2-pre', 'pre'],
  ])('versionSelector(%s) should return %i', (version, expected) => {
    expect(versionSelector(undefined, version)).toEqual(expected.toString());
  });
});
