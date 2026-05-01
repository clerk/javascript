import type { EnterpriseAccountConnectionJSON, EnterpriseAccountJSON } from './JSON';
import { Verification } from './Verification';

/**
 * Represents an enterprise SSO connection associated with an enterprise account.
 */
export class EnterpriseAccountConnection {
  constructor(
    /**
     * The unique identifier for this enterprise connection.
     */
    readonly id: string,
    /**
     * Whether the connection is currently active.
     */
    readonly active: boolean,
    /**
     * Whether IdP-initiated SSO is allowed.
     */
    readonly allowIdpInitiated: boolean,
    /**
     * Whether subdomains are allowed for this connection.
     */
    readonly allowSubdomains: boolean,
    /**
     * Whether additional identifications are disabled for users authenticating via this connection.
     */
    readonly disableAdditionalIdentifications: boolean,
    /**
     * The domain associated with this connection.
     */
    readonly domain: string,
    /**
     * The public URL of the connection's logo, if available.
     */
    readonly logoPublicUrl: string | null,
    /**
     * The name of the enterprise connection.
     */
    readonly name: string,
    /**
     * The SSO protocol used (e.g., `saml` or `oauth`).
     */
    readonly protocol: string,
    /**
     * The SSO provider (e.g., `saml_custom`, `saml_okta`).
     */
    readonly provider: string,
    /**
     * Whether user attributes are synced from the IdP.
     */
    readonly syncUserAttributes: boolean,
    /**
     * The date when this connection was created.
     */
    readonly createdAt: number,
    /**
     * The date when this connection was last updated.
     */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: EnterpriseAccountConnectionJSON): EnterpriseAccountConnection {
    return new EnterpriseAccountConnection(
      data.id,
      data.active,
      data.allow_idp_initiated,
      data.allow_subdomains,
      data.disable_additional_identifications,
      data.domain,
      data.logo_public_url,
      data.name,
      data.protocol,
      data.provider,
      data.sync_user_attributes,
      data.created_at,
      data.updated_at,
    );
  }
}

/**
 * The Backend `EnterpriseAccount` object represents an identification obtained via enterprise SSO (SAML or OIDC).
 */
export class EnterpriseAccount {
  constructor(
    /**
     * The unique identifier for this enterprise account.
     */
    readonly id: string,
    /**
     * Whether this enterprise account is currently active.
     */
    readonly active: boolean,
    /**
     * The email address associated with this enterprise account.
     */
    readonly emailAddress: string,
    /**
     * The enterprise connection through which this account was authenticated.
     */
    readonly enterpriseConnection: EnterpriseAccountConnection | null,
    /**
     * The user's first name as provided by the IdP.
     */
    readonly firstName: string | null,
    /**
     * The user's last name as provided by the IdP.
     */
    readonly lastName: string | null,
    /**
     * The SSO protocol used (e.g., `saml` or `oauth`).
     */
    readonly protocol: string,
    /**
     * The SSO provider (e.g., `saml_custom`, `saml_okta`).
     */
    readonly provider: string,
    /**
     * The unique ID of the user in the provider.
     */
    readonly providerUserId: string | null,
    /**
     * Metadata that can be read from the Frontend API and Backend API and can be set only from the Backend API.
     */
    readonly publicMetadata: Record<string, unknown>,
    /**
     * An object holding information on the verification of this enterprise account.
     */
    readonly verification: Verification | null,
    /**
     * The date when the user last authenticated via this enterprise account.
     */
    readonly lastAuthenticatedAt: number | null,
    /**
     * The ID of the enterprise connection associated with this account.
     */
    readonly enterpriseConnectionId: string | null,
  ) {}

  static fromJSON(data: EnterpriseAccountJSON): EnterpriseAccount {
    return new EnterpriseAccount(
      data.id,
      data.active,
      data.email_address,
      data.enterprise_connection && EnterpriseAccountConnection.fromJSON(data.enterprise_connection),
      data.first_name,
      data.last_name,
      data.protocol,
      data.provider,
      data.provider_user_id,
      data.public_metadata,
      data.verification && Verification.fromJSON(data.verification),
      data.last_authenticated_at,
      data.enterprise_connection_id,
    );
  }
}
