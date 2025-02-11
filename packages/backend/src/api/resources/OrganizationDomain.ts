import type { OrganizationEnrollmentMode } from './Enums';
import type { OrganizationDomainJSON } from './JSON';
import { OrganizationDomainVerification } from './Verification';

export class OrganizationDomain {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly name: string,
    readonly enrollmentMode: OrganizationEnrollmentMode,
    readonly verification: OrganizationDomainVerification | null,
    readonly totalPendingInvitations: number,
    readonly totalPendingSuggestions: number,
    readonly createdAt: number,
    readonly updatedAt: number,
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
