import type { EnterpriseConnectionJSON } from './JSON';

/**
 * The Backend `EnterpriseConnection` object holds information about an enterprise connection (SAML or OAuth) for an instance or organization.
 */
export class EnterpriseConnection {
  constructor(
    /**
     * The unique identifier for the connection.
     */
    readonly id: string,
    /**
     * The name to use as a label for the connection.
     */
    readonly name: string,
    /**
     * The domain of the enterprise. Sign-in flows using an email with this domain may use the connection.
     */
    readonly domains: Array<string>,
    /**
     * The Organization ID if the connection is scoped to an organization.
     */
    readonly organizationId: string | null,
    /**
     * Indicates whether the connection is active or not.
     */
    readonly active: boolean,
    /**
     * Indicates whether the connection syncs user attributes between the IdP and Clerk or not.
     */
    readonly syncUserAttributes: boolean,
    /**
     * Indicates whether users with an email address subdomain are allowed to use this connection or not.
     */
    readonly allowSubdomains: boolean,
    /**
     * Indicates whether additional identifications are disabled for this connection.
     */
    readonly disableAdditionalIdentifications: boolean,
    /**
     * The date when the connection was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the connection was last updated.
     */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: EnterpriseConnectionJSON): EnterpriseConnection {
    return new EnterpriseConnection(
      data.id,
      data.name,
      data.domains,
      data.organization_id,
      data.active,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.disable_additional_identifications,
      data.created_at,
      data.updated_at,
    );
  }
}
