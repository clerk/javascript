import type { EmailAddressResource, EnterpriseConnectionResource } from '@clerk/shared/types';

import type { ProviderType } from '../types';

/**
 * The inputs an {@link OrganizationEnterpriseConnection} aggregate composes: the
 * org-scoped connection, the admin's verification-subject email, and whether a
 * successful test run exists.
 *
 * Every field is a plain value (resource or primitive) — the aggregate is pure
 * and knows nothing about React, the wizard, or how the data was fetched.
 */
export interface OrganizationEnterpriseConnectionInput {
  /**
   * The org-scoped enterprise connection (hydrated, from
   * `__internal_useOrganizationEnterpriseConnections`). FAPI currently supports
   * a single connection per organization.
   */
  connection: EnterpriseConnectionResource | null | undefined;
  /**
   * The email address whose domain backs the connection — the verification
   * subject.
   */
  primaryEmail: EmailAddressResource | null | undefined;
  /**
   * Whether the connection has at least one successful test run. Probed upstream
   * (it is not a property of the connection resource itself).
   */
  hasSuccessfulTestRun: boolean;
}

/**
 * The pure, frozen aggregate over the active organization's SSO-config concern:
 * the connection, the admin's email verification, and the test-run state,
 * composed into one object the wizard makes every flow decision from. Stable
 * facts are fields (`provider`, `hasConnection`); derived predicates are
 * behaviour functions. No hooks, no IO — fetching stays in the hook.
 */
export interface OrganizationEnterpriseConnectionAggregate {
  /**
   * The connection's provider, narrowed to {@link ProviderType}, or `undefined`
   * when there is no connection.
   */
  readonly provider: ProviderType | undefined;
  /**
   * Whether an enterprise connection exists for the organization.
   */
  readonly hasConnection: boolean;
  /**
   * Whether the connection is active (enabled). A missing connection is never
   * active.
   */
  isActive(): boolean;
  /**
   * Whether the connection carries the minimum identity-provider configuration
   * required to advance past the configure step (currently a SAML IdP SSO URL +
   * entity ID).
   */
  // TODO - Update to support OpenID Connect
  hasMinimumConfiguration(): boolean;
  /**
   * Whether the verification-subject email is verified.
   */
  isPrimaryEmailVerified(): boolean;
  /**
   * Whether the connection has at least one successful test run.
   */
  hasSuccessfulTestRun(): boolean;
}

const create = ({
  connection,
  primaryEmail,
  hasSuccessfulTestRun,
}: OrganizationEnterpriseConnectionInput): OrganizationEnterpriseConnectionAggregate => {
  const isPrimaryEmailVerified = (): boolean => primaryEmail?.verification.status === 'verified';

  return Object.freeze({
    provider: connection?.provider as ProviderType | undefined,
    hasConnection: Boolean(connection),
    isActive: () => Boolean(connection?.active),
    // TODO - Update to support OpenID Connect
    hasMinimumConfiguration: () =>
      Boolean(connection?.samlConnection?.idpSsoUrl && connection?.samlConnection?.idpEntityId),
    isPrimaryEmailVerified,
    hasSuccessfulTestRun: () => hasSuccessfulTestRun,
  });
};

/**
 * Builds the {@link OrganizationEnterpriseConnectionAggregate} from the raw
 * inputs gathered in `useOrganizationEnterpriseConnection`.
 */
export const OrganizationEnterpriseConnection = { create } as const;
