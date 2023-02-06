import { getSingleValueFromArrayHeader } from './utils';

describe('utils', () => {
  describe('getSingleValueFromArrayHeader(value)', () => {
    test('returns value if value is not array', () => {
      expect(getSingleValueFromArrayHeader('aloha')).toEqual('aloha');
    });

    test('returns undefined if is falsy value', () => {
      expect(getSingleValueFromArrayHeader()).toBeUndefined();
      expect(getSingleValueFromArrayHeader(undefined)).toBeUndefined();
    });

    test('returns first value if value is array', () => {
      expect(getSingleValueFromArrayHeader(['aloha', '2'])).toEqual('aloha');
    });
  });
});
