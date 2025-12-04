import type { OrganizationInvitationStatus, OrganizationMembershipRole } from './Enums';
import type { OrganizationInvitationJSON, PublicOrganizationDataJSON } from './JSON';

/**
 * The Backend `OrganizationInvitation` object is similar to the [`OrganizationInvitation`](https://clerk.com/docs/reference/javascript/types/organization-invitation) object as it's the model around an Organization invitation. However, the Backend `OrganizationInvitation` object is different in that it's used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/Organization-Invitations#operation/CreateOrganizationInvitation){{ target: '_blank' }} and is not directly accessible from the Frontend API.
 */
export class OrganizationInvitation {
  private _raw: OrganizationInvitationJSON | null = null;

  public get raw(): OrganizationInvitationJSON | null {
    return this._raw;
  }

  constructor(
    /**
     * The unique identifier for the `OrganizationInvitation`.
     */
    readonly id: string,
    /**
     * The email address of the user who is invited to the [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization).
     */
    readonly emailAddress: string,
    /**
     * The Role of the invited user.
     */
    readonly role: OrganizationMembershipRole,
    /**
     * The name of the Role of the invited user.
     */
    readonly roleName: string,
    /**
     * The ID of the [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization) that the user is invited to.
     */
    readonly organizationId: string,
    /**
     * The date when the invitation was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the invitation was last updated.
     */
    readonly updatedAt: number,
    /**
     * The date when the invitation expires.
     */
    readonly expiresAt: number,
    /**
     * The URL that the user can use to accept the invitation.
     */
    readonly url: string | null,
    /**
     * The status of the invitation.
     */
    readonly status?: OrganizationInvitationStatus,
    /**
     * Metadata that can be read from the Frontend API and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }} and can be set only from the Backend API.
     */
    readonly publicMetadata: OrganizationInvitationPublicMetadata = {},
    /**
     * Metadata that can be read and set only from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}.
     */
    readonly privateMetadata: OrganizationInvitationPrivateMetadata = {},
    /**
     * Public data about the Organization that the user is invited to.
     */
    readonly publicOrganizationData?: PublicOrganizationDataJSON | null,
  ) {}

  static fromJSON(data: OrganizationInvitationJSON) {
    const res = new OrganizationInvitation(
      data.id,
      data.email_address,
      data.role,
      data.role_name,
      data.organization_id,
      data.created_at,
      data.updated_at,
      data.expires_at,
      data.url,
      data.status,
      data.public_metadata,
      data.private_metadata,
      data.public_organization_data,
    );
    res._raw = data;
    return res;
  }
}
