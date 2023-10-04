/* eslint-disable @typescript-eslint/ban-ts-comment */
import { versionSelector } from '../versionSelector';

describe('versionSelector', () => {
  it('should return the clerkJSVersion if it is provided', () => {
    expect(versionSelector('1.0.0')).toEqual('1.0.0');
  });
  it('should use the major version if there is no prerelease tag', () => {
    // @ts-ignore
    global.PACKAGE_VERSION = '1.0.0';
    // @ts-ignore
    global.JS_PACKAGE_VERSION = '2.0.0';

    expect(versionSelector(undefined)).toEqual('1');
  });
  it('should use the prerelease tag when it is not snapshot', () => {
    // @ts-ignore
    global.PACKAGE_VERSION = '1.0.0-next.0';
    // @ts-ignore
    global.JS_PACKAGE_VERSION = '2.0.0-next.0';

    expect(versionSelector(undefined)).toEqual('next');
  });
  it('should use the exact JS version if tag is snapshot', () => {
    // @ts-ignore
    global.PACKAGE_VERSION = '1.0.0-snapshot.0';
    // @ts-ignore
    global.JS_PACKAGE_VERSION = '2.0.0-snapshot.0';

    expect(versionSelector(undefined)).toEqual('2.0.0-snapshot.0');
  });
});
