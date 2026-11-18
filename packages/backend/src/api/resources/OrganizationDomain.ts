import type { OrganizationEnrollmentMode } from './Enums';
import type { OrganizationDomainJSON } from './JSON';
import { OrganizationDomainVerification } from './Verification';

/** The `OrganizationDomain` object is the model around an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains). */
export class OrganizationDomain {
  constructor(
    /** The unique identifier of the domain. */
    readonly id: string,
    /** The ID of the Organization that the domain belongs to. */
    readonly organizationId: string,
    /** The name of the domain. */
    readonly name: string,
    /**
     * The enrollment mode that determines how matching users are added to the Organization.
     *
     * <ul>
     *  <li>`manual_invitation`: No automatic enrollment. Users with a matching email domain are not given any [invitation](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-invitations) or [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions); an [admin](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions#default-roles) must invite them manually.</li>
     *  <li>`automatic_invitation`: Users with a matching email domain automatically receive a pending [invitation](https://clerk.com/docs/reference/types/organization-invitation) (assigned the Organization's default role) which they can accept to join.</li>
     *  <li>`automatic_suggestion`: Users with a matching email domain automatically receive a [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions) to join, which they can request.</li>
     * </ul>
     */
    readonly enrollmentMode: OrganizationEnrollmentMode,
    /** The verification details of the domain. */
    readonly verification: OrganizationDomainVerification | null,
    /** The total number of pending invitations for the domain. */
    readonly totalPendingInvitations: number,
    /** The total number of pending suggestions for the domain. */
    readonly totalPendingSuggestions: number,
    /** The Unix timestamp when the domain was created. */
    readonly createdAt: number,
    /** The Unix timestamp when the domain was last updated. */
    readonly updatedAt: number,
    /** The email address used to verify the domain. */
    readonly affiliationEmailAddress: string | null,
  ) {}

  static fromJSON(data: OrganizationDomainJSON) {
    return new OrganizationDomain(
      data.id,
      data.organization_id,
      data.name,
      data.enrollment_mode,
      data.verification && OrganizationDomainVerification.fromJSON(data.verification),
      data.total_pending_invitations,
      data.total_pending_suggestions,
      data.created_at,
      data.updated_at,
      data.affiliation_email_address,
    );
  }
}
