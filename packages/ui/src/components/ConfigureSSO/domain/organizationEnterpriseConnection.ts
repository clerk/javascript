import type { EmailAddressResource, EnterpriseConnectionResource } from '@clerk/shared/types';

import type { ProviderType } from '../types';

/**
 * The inputs {@link organizationEnterpriseConnection} composes. Every field is a
 * plain value — the entity is pure and knows nothing about React or the wizard.
 */
export interface OrganizationEnterpriseConnectionInput {
  /** FAPI currently supports a single connection per organization. */
  connection: EnterpriseConnectionResource | null | undefined;
  /** The email address whose domain backs the connection. */
  primaryEmail: EmailAddressResource | null | undefined;
  /** Probed upstream — not a property of the connection resource itself. */
  hasSuccessfulTestRun: boolean;
}

/**
 * The active organization's SSO-config domain entity: an immutable, pure value
 * object the wizard makes every flow decision from. A snapshot of flattened
 * booleans/values, never mutated in place, knowing nothing about React.
 */
export interface OrganizationEnterpriseConnection {
  readonly provider: ProviderType | undefined;
  readonly hasConnection: boolean;
  readonly isActive: boolean;
  /**
   * The minimum IdP config to advance past the configure step (currently a SAML
   * IdP SSO URL + entity ID).
   */
  // TODO - Update to support OpenID Connect
  readonly hasMinimumConfiguration: boolean;
  readonly isPrimaryEmailVerified: boolean;
  readonly hasSuccessfulTestRun: boolean;
}

/**
 * Whether the connection has the minimum IdP config to advance past configure.
 * A pure predicate over the RAW connection (no derived state) — so it is safe
 * both inside {@link organizationEnterpriseConnection} and to gate the test-runs
 * source upstream without a circular dependency on the built entity.
 */
// TODO - Update to support OpenID Connect
export const isEnterpriseConnectionConfigured = (
  connection: EnterpriseConnectionResource | null | undefined,
): boolean => Boolean(connection?.samlConnection?.idpSsoUrl && connection?.samlConnection?.idpEntityId);

/**
 * Builds the {@link OrganizationEnterpriseConnection} entity from the raw inputs.
 * Pure: identical inputs yield a deep-equal immutable value object.
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
