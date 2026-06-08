import type { EmailAddressResource, EnterpriseConnectionResource } from '@clerk/shared/types';

import type { ProviderType } from '../types';

/**
 * The inputs {@link organizationEnterpriseConnection} composes: the org-scoped
 * connection, the admin's verification-subject email, and whether a successful
 * test run exists.
 *
 * Every field is a plain value (resource or primitive) — the entity is pure and
 * knows nothing about React, the wizard, or how the data was fetched.
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
 * The active organization's SSO-config domain entity: an immutable value object
 * derived from the org-scoped connection, the admin's verification email, and
 * the test-run fact. Pure and tech-agnostic — it carries the flattened
 * booleans/values the wizard makes every flow decision from, and knows nothing
 * about React, the wizard, or how its inputs were fetched. Its fields are
 * `readonly`: the entity is a snapshot, never mutated in place.
 */
export interface OrganizationEnterpriseConnection {
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
  readonly isActive: boolean;
  /**
   * Whether the connection carries the minimum identity-provider configuration
   * required to advance past the configure step (currently a SAML IdP SSO URL +
   * entity ID).
   */
  // TODO - Update to support OpenID Connect
  readonly hasMinimumConfiguration: boolean;
  /**
   * Whether the verification-subject email is verified.
   */
  readonly isPrimaryEmailVerified: boolean;
  /**
   * Whether the connection has at least one successful test run.
   */
  readonly hasSuccessfulTestRun: boolean;
}

/**
 * Whether the connection carries the minimum identity-provider configuration
 * required to advance past the configure step (currently a SAML IdP SSO URL +
 * entity ID). A pure predicate over the raw connection — it reads no derived
 * state, so it is safe to use both inside {@link organizationEnterpriseConnection}
 * and to gate the test-runs source upstream without a circular dependency on
 * the built entity.
 */
// TODO - Update to support OpenID Connect
export const isEnterpriseConnectionConfigured = (
  connection: EnterpriseConnectionResource | null | undefined,
): boolean => Boolean(connection?.samlConnection?.idpSsoUrl && connection?.samlConnection?.idpEntityId);

/**
 * Builds the {@link OrganizationEnterpriseConnection} entity from the raw inputs
 * gathered in `useOrganizationEnterpriseConnection`. A bare factory: the noun is
 * the verb. Pure — identical inputs yield a deep-equal entity — and returns a
 * plain immutable value object.
 */
export const organizationEnterpriseConnection = ({
  connection,
  primaryEmail,
  hasSuccessfulTestRun,
}: OrganizationEnterpriseConnectionInput): OrganizationEnterpriseConnection => ({
  provider: connection?.provider as ProviderType | undefined,
  hasConnection: Boolean(connection),
  isActive: Boolean(connection?.active),
  hasMinimumConfiguration: isEnterpriseConnectionConfigured(connection),
  isPrimaryEmailVerified: primaryEmail?.verification?.status === 'verified',
  hasSuccessfulTestRun,
});
