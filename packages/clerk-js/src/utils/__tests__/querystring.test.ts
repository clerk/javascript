import { camelToSnake } from '@clerk/shared';

import { getQueryParams, stringifyQueryParams } from '../querystring';

describe('getQueryParams(string)', () => {
  it('parses an emtpy querystring', () => {
    const res = getQueryParams('');
    expect(res).toEqual({});
  });

  it('parses a querystring into a URLSearchParams instance', () => {
    const res = getQueryParams('foo=42&bar=43');
    expect(res).toEqual({ foo: '42', bar: '43' });
  });

  it('parses a querystring into a URLSearchParams instance even when prefixed with ?', () => {
    const res = getQueryParams('?foo=42&bar=43');
    expect(res).toEqual({ foo: '42', bar: '43' });
  });

  it('parses multiple occurances of the same key as an array', () => {
    const res = getQueryParams('?foo=42&foo=43&bar=1');
    expect(res).toEqual({ foo: ['42', '43'], bar: '1' });
  });
});

describe('stringifyQueryParams(object)', () => {
  // it('converts an object to querystring', () => {
  //   expect(stringifyQueryParams({})).toEqual('');
  //   expect(stringifyQueryParams({ foo: '42', bar: '43' })).toBe('foo=42&bar=43');
  //   expect(stringifyQueryParams({ foo: ['42', '22'], bar: '43' })).toBe('foo=42&foo=22&bar=43');
  //   expect(stringifyQueryParams({ foo: ['42', '22'], bar: undefined })).toBe('foo=42&foo=22');
  //   expect(stringifyQueryParams({ unsafeMetadata: { bar: '1' } })).toBe('unsafe_metadata=%7B%22bar%22%3A%221%22%7D');
  // });

  it('converts an object to querystring', () => {
    expect(stringifyQueryParams({ foo: '42', bar: '43' })).toBe('foo=42&bar=43');
  });
  it('converts an object to querystring when value is an array', () => {
    expect(stringifyQueryParams({ foo: ['42', '22'], bar: '43' })).toBe('foo=42&foo=22&bar=43');
  });
  it('converts an object to querystring when value is undefined', () => {
    expect(stringifyQueryParams({ foo: ['42', '22'], bar: undefined })).toBe('foo=42&foo=22');
  });
  it('converts an object to querystring when value is an object', () => {
    expect(stringifyQueryParams({ unsafe_metadata: { bar: '1' } })).toBe('unsafe_metadata=%7B%22bar%22%3A%221%22%7D');
  });

  it('converts an object to querystring when key is camelCase', () => {
    expect(stringifyQueryParams({ barFoo: '1' }, { encoder: camelToSnake })).toBe('bar_foo=1');
    expect(stringifyQueryParams({ unsafeMetadata: { bar: '1' } }, { encoder: camelToSnake })).toBe(
      'unsafe_metadata=%7B%22bar%22%3A%221%22%7D',
    );
  });
});
