import type {
  EnterpriseConnectionResource,
  OrganizationResource,
  SignedInSessionResource,
  UserResource,
} from '@clerk/shared/types';

import type { ProviderType } from '../types';

/**
 * The single set of derived booleans the ConfigureSSO wizard makes decisions
 * from (e.g. which step to mount on). Every piece of derivation that used to
 * live inline across `ConfigureSSOContext` and `deriveInitialStep` is folded
 * into {@link deriveFacts} so there is exactly one place that interprets the
 * raw resources.
 */
export interface WizardFacts {
  /**
   * Whether an enterprise connection already exists for the user's domain.
   */
  hasConnection: boolean;
  /**
   * Whether the email address used to derive the connection is verified.
   */
  isPrimaryEmailVerified: boolean;
  /**
   * Whether the user's domain is already wired to an enterprise connection
   * that belongs to a different org than the one currently being configured.
   */
  isDomainTakenByOtherOrg: boolean;
  /**
   * Whether the connection has the minimum IdP configuration required to move
   * past the configure step (currently SAML IdP SSO URL + entity ID).
   */
  hasMinimumIdPConfig: boolean;
  /**
   * Whether the connection has at least one successful test run.
   */
  hasSuccessfulTestRun: boolean;
  /**
   * Whether the connection is active (enabled).
   */
  isConnectionActive: boolean;
  /**
   * The provider of the existing connection, if any.
   */
  provider: ProviderType | undefined;
}

interface DeriveFactsInput {
  user: UserResource | null | undefined;
  session: SignedInSessionResource | null | undefined;
  connection: EnterpriseConnectionResource | undefined;
  hasSuccessfulTestRun: boolean;
  organization: OrganizationResource | null | undefined;
}

/**
 * Pure derivation of {@link WizardFacts} from the raw resources the wizard
 * fetches. No hooks, no side effects — safe to unit test in isolation.
 */
export const deriveFacts = ({ user, session, connection, hasSuccessfulTestRun }: DeriveFactsInput): WizardFacts => {
  const emailToVerify =
    user?.primaryEmailAddress ?? user?.emailAddresses?.find(e => e.verification.status !== 'verified');
  const isPrimaryEmailVerified = emailToVerify?.verification.status === 'verified';
  const activeOrganizationId = session?.lastActiveOrganizationId ?? null;

  const isDomainTakenByOtherOrg = Boolean(
    isPrimaryEmailVerified && connection && connection.organizationId !== activeOrganizationId,
  );

  return {
    hasConnection: Boolean(connection),
    isPrimaryEmailVerified,
    isDomainTakenByOtherOrg,
    hasMinimumIdPConfig: checkHasMinimumIdPConfiguration(connection),
    hasSuccessfulTestRun,
    isConnectionActive: Boolean(connection?.active),
    provider: connection?.provider as ProviderType | undefined,
  };
};

/**
 * Whether the connection carries the minimum IdP configuration required to
 * advance past the configure step.
 */
// TODO - Update to support OpenID Connect
const checkHasMinimumIdPConfiguration = (connection: EnterpriseConnectionResource | undefined): boolean => {
  return Boolean(connection?.samlConnection?.idpSsoUrl && connection?.samlConnection?.idpEntityId);
};
