import { handleDomainStringOrFn, handleIsSatelliteBooleanOrFn } from './multiDomain';

const url = new URL('https://example.com');

describe('handleIsSatelliteBooleanOrFn(opts)', () => {
  it.each([
    [{}, false],
    [{ isSatellite: true }, true],
    [{ isSatellite: false }, false],
    [{ isSatellite: undefined }, false],
    [{ isSatellite: () => true }, true],
    [{ isSatellite: () => false }, false],
  ])('.handleIsSatelliteBooleanOrFn(%s)', (key, expected) => {
    expect(handleIsSatelliteBooleanOrFn(key, url)).toBe(expected);
  });
});

type OptionsWithDomain = Parameters<typeof handleDomainStringOrFn>[0];

describe('handleDomainStringOrFn(opts)', () => {
  it.each<[OptionsWithDomain, string]>([
    [{}, ''],
    [{ domain: '' }, ''],
    [{ domain: 'some-domain' }, 'some-domain'],
    [{ domain: 'clerk.dev' }, 'clerk.dev'],
    [{ domain: url => url.host }, 'example.com'],
    [{ domain: () => 'some-other-domain' }, 'some-other-domain'],
  ])('.handleDomainStringOrFn(%s)', (key, expected) => {
    expect(handleDomainStringOrFn(key, url)).toBe(expected);
  });
});
