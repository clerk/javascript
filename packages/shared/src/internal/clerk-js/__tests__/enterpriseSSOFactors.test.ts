import { describe, expect, it } from 'vitest';

import type { SignInFirstFactor } from '@/types';

import { getEnterpriseConnectionFactors, hasMultipleEnterpriseConnections } from '../enterpriseSSOFactors';

const connectionA = {
  strategy: 'enterprise_sso',
  enterpriseConnectionId: 'ec_1',
  enterpriseConnectionName: 'A',
} as SignInFirstFactor;

const connectionB = {
  strategy: 'enterprise_sso',
  enterpriseConnectionId: 'ec_2',
  enterpriseConnectionName: 'B',
} as SignInFirstFactor;

const bareEnterpriseSSO = { strategy: 'enterprise_sso' } as SignInFirstFactor;

describe('hasMultipleEnterpriseConnections', () => {
  it.each([
    ['null', null, false],
    ['no factors', [], false],
    ['one bare enterprise_sso factor', [bareEnterpriseSSO], false],
    ['two bare enterprise_sso factors', [bareEnterpriseSSO, bareEnterpriseSSO], false],
    ['one enterprise connection', [connectionA], false],
    ['two enterprise connections', [connectionA, connectionB], true],
    ['a password factor plus two enterprise connections', [{ strategy: 'password' }, connectionA, connectionB], true],
  ] as Array<[string, SignInFirstFactor[] | null, boolean]>)(
    'returns the expected value for %s',
    (_, factors, expected) => {
      expect(hasMultipleEnterpriseConnections(factors)).toBe(expected);
    },
  );
});

describe('getEnterpriseConnectionFactors', () => {
  it('returns only the enterprise connections from a mixed factor list', () => {
    expect(
      getEnterpriseConnectionFactors([
        { strategy: 'password' } as SignInFirstFactor,
        bareEnterpriseSSO,
        connectionA,
        connectionB,
      ]),
    ).toEqual([connectionA, connectionB]);
  });

  it('returns an empty list when there are no factors', () => {
    expect(getEnterpriseConnectionFactors(null)).toEqual([]);
    expect(getEnterpriseConnectionFactors(undefined)).toEqual([]);
  });
});
