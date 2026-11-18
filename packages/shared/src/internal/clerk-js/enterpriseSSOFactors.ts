import type { EnterpriseSSOFactor, SignInFirstFactor } from '../../types';

type EnterpriseConnectionFactor = EnterpriseSSOFactor & {
  enterpriseConnectionId: string;
  enterpriseConnectionName: string;
};

export function getEnterpriseConnectionFactors(
  factors: SignInFirstFactor[] | null | undefined,
): EnterpriseConnectionFactor[] {
  return (factors ?? []).filter(
    (factor): factor is EnterpriseConnectionFactor =>
      factor.strategy === 'enterprise_sso' &&
      'enterpriseConnectionId' in factor &&
      'enterpriseConnectionName' in factor,
  );
}

export function hasMultipleEnterpriseConnections(factors: SignInFirstFactor[] | null | undefined): boolean {
  return getEnterpriseConnectionFactors(factors).length > 1;
}
