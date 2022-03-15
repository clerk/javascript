import { deepCamelToSnake, deepSnakeToCamel } from './object';

describe('camelToSnakeKeys', () => {
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
