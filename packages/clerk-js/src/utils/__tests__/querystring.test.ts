import { getQueryParams, stringifyQueryParams } from '../querystring';

describe('getQueryParams(string)', () => {
  it('parses a querystring', () => {
    expect(getQueryParams('')).toEqual({});
    expect(getQueryParams('foo=42&bar=43')).toEqual({ foo: '42', bar: '43' });
    expect(getQueryParams('?foo=42&bar=43')).toEqual({ foo: '42', bar: '43' });
  });
});

describe('stringifyQueryParams(object)', () => {
  it('converts an object to querystring', () => {
    expect(stringifyQueryParams({})).toEqual('');
    expect(stringifyQueryParams({ foo: '42', bar: '43' })).toBe('foo=42&bar=43');
    expect(stringifyQueryParams({ foo: ['42', '22'], bar: '43' })).toBe('foo=42&foo=22&bar=43');
    expect(stringifyQueryParams({ foo: ['42', '22'], bar: undefined })).toBe('foo=42&foo=22');
  });
});
