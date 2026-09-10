import type { EnterpriseSSOFactor, SignInFirstFactor, SignInResource } from '@clerk/shared/types';

/**
 * Whether every supported first factor hands off to an enterprise connection, i.e. there is no
 * factor the sign-in card could render instead.
 */
function hasOnlyEnterpriseSSOFirstFactors(signIn: SignInResource): boolean {
  if (!signIn.supportedFirstFactors?.length) {
    return false;
  }

  return signIn.supportedFirstFactors.every(ff => ff.strategy === 'enterprise_sso');
}

/**
 * Type guard that checks if all factors in the array are enterprise SSO factors
 * with both `enterpriseConnectionId` and `enterpriseConnectionName` properties.
 * This is used to determine if the user should be presented with a choice
 * between multiple enterprise connections.
 * @experimental
 */
function hasMultipleEnterpriseConnections(
  factors: SignInFirstFactor[] | null,
): factors is Array<EnterpriseSSOFactor & { enterpriseConnectionId: string; enterpriseConnectionName: string }> {
  if (!factors?.length) {
    return false;
  }

  return (
    factors.filter(
      factor =>
        factor.strategy === 'enterprise_sso' &&
        'enterpriseConnectionId' in factor &&
        'enterpriseConnectionName' in factor,
    ).length > 1
  );
}

/**
 * Whether the sign-in should be handed straight to an enterprise connection rather than rendered
 * as a first factor: SSO is the only way in, and there is a single connection to hand off to.
 *
 * Every place that continues a sign-in has to ask this — an SSO-only sign-in has no first factor
 * to render, so routing it to the factor-one card leaves the user on alternative methods with no
 * way to reach their identity provider. More than one connection is the exception: that is a
 * choice, and the factor-one card presents it.
 */
function shouldHandOffToEnterpriseConnection(signIn: SignInResource): boolean {
  return (
    hasOnlyEnterpriseSSOFirstFactors(signIn) && !hasMultipleEnterpriseConnections(signIn.supportedFirstFactors ?? null)
  );
}

export { hasMultipleEnterpriseConnections, hasOnlyEnterpriseSSOFirstFactors, shouldHandOffToEnterpriseConnection };
