import type { EmailAddressResource, EnterpriseConnectionResource } from '@clerk/shared/types';

import type { ProviderType } from '../types';

/**
 * The inputs {@link deriveEnterpriseConnectionState} composes: the org-scoped
 * connection, the admin's verification-subject email, and whether a successful
 * test run exists.
 *
 * Every field is a plain value (resource or primitive) — derivation is pure and
 * knows nothing about React, the wizard, or how the data was fetched.
 */
export interface EnterpriseConnectionStateInput {
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
 * A plain, derived snapshot over the active organization's SSO-config concern:
 * the connection, the admin's email verification, and the test-run state, all
 * flattened to booleans/values the wizard makes every flow decision from. No
 * behaviour methods, no `Object.freeze` — just derived state.
 */
export interface EnterpriseConnectionState {
  /**
   * The connection's provider, narrowed to {@link ProviderType}, or `undefined`
   * when there is no connection.
   */
  provider: ProviderType | undefined;
  /**
   * Whether an enterprise connection exists for the organization.
   */
  hasConnection: boolean;
  /**
   * Whether the connection is active (enabled). A missing connection is never
   * active.
   */
  isActive: boolean;
  /**
   * Whether the connection carries the minimum identity-provider configuration
   * required to advance past the configure step (currently a SAML IdP SSO URL +
   * entity ID).
   */
  // TODO - Update to support OpenID Connect
  hasMinimumConfiguration: boolean;
  /**
   * Whether the verification-subject email is verified.
   */
  isPrimaryEmailVerified: boolean;
  /**
   * Whether the connection has at least one successful test run.
   */
  hasSuccessfulTestRun: boolean;
}

/**
 * Whether the connection carries the minimum identity-provider configuration
 * required to advance past the configure step (currently a SAML IdP SSO URL +
 * entity ID). A pure predicate over the raw connection — it reads no derived
 * state, so it is safe to use both inside {@link deriveEnterpriseConnectionState}
 * and to gate the test-runs source upstream without a circular dependency on
 * the derived snapshot.
 */
// TODO - Update to support OpenID Connect
export const isEnterpriseConnectionConfigured = (
  connection: EnterpriseConnectionResource | null | undefined,
): boolean => Boolean(connection?.samlConnection?.idpSsoUrl && connection?.samlConnection?.idpEntityId);

/**
 * Builds the {@link EnterpriseConnectionState} from the raw inputs gathered in
 * `useOrganizationEnterpriseConnection`. Pure: identical inputs yield identical
 * state.
 */
export const deriveEnterpriseConnectionState = ({
  connection,
  primaryEmail,
  hasSuccessfulTestRun,
}: EnterpriseConnectionStateInput): EnterpriseConnectionState => ({
  provider: connection?.provider as ProviderType | undefined,
  hasConnection: Boolean(connection),
  isActive: Boolean(connection?.active),
  hasMinimumConfiguration: isEnterpriseConnectionConfigured(connection),
  isPrimaryEmailVerified: primaryEmail?.verification?.status === 'verified',
  hasSuccessfulTestRun,
});
