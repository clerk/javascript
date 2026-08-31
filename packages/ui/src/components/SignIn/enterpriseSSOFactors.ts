import type { EmailCodeFactor, EnterpriseSSOFactor, SignInFirstFactor, SignInResource } from '@clerk/shared/types';

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
 * Returns the email code factor a sign-in may fall back to, or `null`.
 * @experimental
 */
function getSSOBypassFactor(signIn: SignInResource): EmailCodeFactor | null {
  if (!signIn.supportedFirstFactors?.some(factor => factor.strategy === 'enterprise_sso')) {
    return null;
  }

  return (signIn.ssoBypassFirstFactors?.find(factor => factor.strategy === 'email_code') as EmailCodeFactor) ?? null;
}

/**
 * Whether the sign-in should be handed straight to an enterprise connection rather than rendered
 * as a first factor: SSO is the only way in, there is a single connection to hand off to, and the
 * user has no SSO bypass to choose instead.
 *
 * Every place that continues a sign-in has to ask this — an SSO-only sign-in has no first factor
 * to render, so routing it to the factor-one card leaves the user on alternative methods with no
 * way to reach their identity provider. A connection choice and an SSO bypass are the exceptions:
 * both are choices, and the factor-one card presents them.
 */
function shouldHandOffToEnterpriseConnection(signIn: SignInResource): boolean {
  return (
    hasOnlyEnterpriseSSOFirstFactors(signIn) &&
    !hasMultipleEnterpriseConnections(signIn.supportedFirstFactors ?? null) &&
    !getSSOBypassFactor(signIn)
  );
}

export {
  getSSOBypassFactor,
  hasMultipleEnterpriseConnections,
  hasOnlyEnterpriseSSOFirstFactors,
  shouldHandOffToEnterpriseConnection,
};
