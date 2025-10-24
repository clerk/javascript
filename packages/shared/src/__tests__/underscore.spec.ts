import { describe, expect, it } from 'vitest';

import {
  deepCamelToSnake,
  deepSnakeToCamel,
  getNonUndefinedValues,
  isIPV4Address,
  isTruthy,
  titleize,
  toSentence,
} from '../underscore';

describe('toSentence', () => {
  it('returns a single item as-is', () => {
    expect(toSentence(['xyz'])).toBe('xyz');
    expect(toSentence(['abc'])).toBe('abc');
  });

  it('joins multiple items but the last with a comma and the last with ", or"', () => {
    expect(toSentence(['abc', 'def'])).toBe('abc, or def');
    expect(toSentence(['qwe', 'zxc', 'asd'])).toBe('qwe, zxc, or asd');
  });

  it('returns empty string if passed an empty array', () => {
    expect(toSentence([])).toBe('');
  });
});

describe('isIPV4Address(str)', () => {
  it('checks if as string is an IP V4', () => {
    expect(isIPV4Address(null)).toBe(false);
    expect(isIPV4Address(undefined)).toBe(false);
    expect(isIPV4Address('')).toBe(false);
    expect(isIPV4Address('127.0.0.1')).toBe(true);
  });
});

describe('titleize(str)', () => {
  it('titleizes the string', () => {
    expect(titleize(null)).toBe('');
    expect(titleize(undefined)).toBe('');
    expect(titleize('')).toBe('');
    expect(titleize('foo')).toBe('Foo');
    expect(titleize('foo bar')).toBe('Foo bar');
  });
});

describe('camelToSnakeKeys', () => {
  it('creates a copy and does not modify the original', () => {
    const original = {
      an_arr: [{ hello_there: 'hey' }],
      a_nested_object: { a_message: 'hey' },
    };
    const originalCopy = { ...original };
    const res = deepSnakeToCamel(original);
    expect(res).toStrictEqual({
      anArr: [{ helloThere: 'hey' }],
      aNestedObject: { aMessage: 'hey' },
    });
    expect(original).toStrictEqual(originalCopy);
    expect(original === res).toBeFalsy();
  });

  it('transforms camelCased keys to snake_cased', () => {
    expect(deepCamelToSnake({ key: 1, anotherKey: 2 })).toStrictEqual({
      key: 1,
      another_key: 2,
    });

    expect(
      deepCamelToSnake({
        key: 1,
        anotherKey: 2,
        nestAttribute: { nestedKey: 3 },
      }),
    ).toStrictEqual({
      key: 1,
      another_key: 2,
      nest_attribute: {
        nested_key: 3,
      },
    });
  });

  it('handles null and undefined values', () => {
    expect(deepCamelToSnake({ key: 1, anotherKey: null })).toStrictEqual({
      key: 1,
      another_key: null,
    });

    expect(
      deepCamelToSnake({
        key: 1,
        anotherKey: 2,
        nestAttribute: { nestedKey: null },
      }),
    ).toStrictEqual({
      key: 1,
      another_key: 2,
      nest_attribute: {
        nested_key: null,
      },
    });
  });

  it('transforms and removes camelCased keys', () => {
    const sampleObject = deepCamelToSnake({ key: 1, anotherKey: 2 });
    expect(sampleObject).not.toHaveProperty('anotherKey');
    expect(sampleObject).toHaveProperty('another_key');
  });

  it('deeply transforms objects and arrays to camelCase', () => {
    const sample = {
      sessions: [
        {
          last_active_at: 1647133602586,
          user: {
            primary_web3_wallet_id: null,
            email_addresses: [
              {
                email_address: 'n@ck.dev',
                verification: {
                  status: 'verified',
                  strategy: 'email_link',
                  expire_at: 1645216476574,
                },
                linked_to: [{ type: 'oauth_google', id: 'idn_25QqWb' }],
              },
            ],
            web3_wallets: [],
            external_accounts: [
              {
                identification_id: 'idn_25QqWbzargsao',
                provider_user_id: '106087',
              },
            ],
          },
        },
      ],
      sign_in_attempt: null,
    };

    const expected = {
      sessions: [
        {
          user: {
            primaryWeb3WalletId: null,
            emailAddresses: [
              {
                verification: {
                  status: 'verified',
                  strategy: 'email_link',
                  expireAt: 1645216476574,
                },
                emailAddress: 'n@ck.dev',
                linkedTo: [
                  {
                    type: 'oauth_google',
                    id: 'idn_25QqWb',
                  },
                ],
              },
            ],
            web3Wallets: [],
            externalAccounts: [
              {
                identificationId: 'idn_25QqWbzargsao',
                providerUserId: '106087',
              },
            ],
          },
          lastActiveAt: 1647133602586,
        },
      ],
      signInAttempt: null,
    };
    const res = deepSnakeToCamel(sample);
    expect(res).toStrictEqual(expected);
  });

  it('prioritizes the camelCased property', () => {
    const sampleObject = deepCamelToSnake({ oneKey: 1, one_key: 2 });
    const anotherSampleObject = deepCamelToSnake({ one_key: 2, oneKey: 1 });

    expect(sampleObject.one_key).toEqual(1);
    expect(sampleObject).not.toHaveProperty('oneKey');
    expect(anotherSampleObject.one_key).toEqual(1);
    expect(anotherSampleObject).not.toHaveProperty('oneKey');
  });
});

describe(`isTruthy`, () => {
  it(`handles booleans`, () => {
    expect(isTruthy(true)).toBe(true);
    expect(isTruthy(false)).toBe(false);
  });
  it(`handles true or false strings `, () => {
    expect(isTruthy(`true`)).toBe(true);
    expect(isTruthy(`false`)).toBe(false);
    expect(isTruthy(`TRUE`)).toBe(true);
    expect(isTruthy(`FALSE`)).toBe(false);
    expect(isTruthy(`TruE`)).toBe(true);
    expect(isTruthy(`FalsE`)).toBe(false);
  });
  it(`handles numbers`, () => {
    expect(isTruthy(`1`)).toBe(true);
    expect(isTruthy(`0`)).toBe(false);
    expect(isTruthy(`-1`)).toBe(false);
    expect(isTruthy(1)).toBe(true);
    expect(isTruthy(0)).toBe(false);
    expect(isTruthy(-1)).toBe(false);
  });
  it(`defaults to false`, () => {
    expect(isTruthy(`foobar`)).toBe(false);
  });
});

describe('getNonUndefinedValues', () => {
  it(`removes all the undefined values from the object`, () => {
    const obj = {
      a: 1,
      b: undefined,
      c: null,
    };
    expect(getNonUndefinedValues(obj)).toStrictEqual({
      a: 1,
      c: null,
    });
  });

  it(`returns the same object if no undefined value exists`, () => {
    const obj = {
      a: 1,
      b: 'foo',
      c: null,
    };
    expect(getNonUndefinedValues(obj)).toStrictEqual(obj);
    expect(getNonUndefinedValues({})).toStrictEqual({});
  });

  it(`removes only the undefined values from the top level`, () => {
    const obj = {
      a: 1,
      b: undefined,
      c: null,
      e: {
        f: undefined,
        g: 1,
      },
    };
    expect(getNonUndefinedValues(obj)).toStrictEqual({
      a: 1,
      c: null,
      e: {
        f: undefined,
        g: 1,
      },
    });
  });
});
