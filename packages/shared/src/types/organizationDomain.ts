import type { ClerkResource } from './resource';

/**
 * Holds the verification details of an Organization's Verified Domain.
 */
export interface OrganizationDomainVerification {
  /**
   * The current status of the domain verification.
   */
  status: OrganizationDomainVerificationStatus;
  /**
   * The strategy used to verify the domain.
   */
  strategy: OrganizationDomainVerificationStrategy;
  /**
   * The number of verification attempts that have been made.
   */
  attempts: number;
  /**
   * The date and time when the current verification attempt expires.
   */
  expiresAt: Date;
}

/** @inline */
type OrganizationDomainVerificationStrategy = 'email_code';

/** @inline */
export type OrganizationDomainVerificationStatus = 'unverified' | 'verified';

/** @inline */
export type OrganizationEnrollmentMode = 'manual_invitation' | 'automatic_invitation' | 'automatic_suggestion';

/**
 * The `OrganizationDomain` object is the model around an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains).
 *
 * @interface
 */
export interface OrganizationDomainResource extends ClerkResource {
  /**
   * The unique identifier for the Verified Domain.
   */
  id: string;
  /**
   * The domain name, for example `clerk.com`.
   */
  name: string;
  /**
   * The ID of the Organization that the Verified Domain belongs to.
   */
  organizationId: string;
  /**
   * The enrollment mode that determines how matching users are added to the Organization.
   *
   * <ul>
   *  <li>`manual_invitation`: No automatic enrollment. Users with a matching email domain are not given any [invitation](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-invitations) or [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions); an admin must invite them manually.</li>
   *  <li>`automatic_invitation`: Users with a matching email domain automatically receive a pending [invitation](https://clerk.com/docs/reference/types/organizationinvitation) (assigned the Organization's default role) which they can accept to join.</li>
   *  <li>`automatic_suggestion`: Users with a matching email domain automatically receive a [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions) to join, which they can request.</li>
   * </ul>
   */
  enrollmentMode: OrganizationEnrollmentMode;
  /**
   * The verification details for the domain, or `null` if the domain has not been verified.
   */
  verification: OrganizationDomainVerification | null;
  /**
   * The date and time when the domain was created.
   */
  createdAt: Date;
  /**
   * The date and time when the domain was last updated.
   */
  updatedAt: Date;
  /**
   * The email address used to verify the affiliation with the domain, or `null` if none has been provided.
   */
  affiliationEmailAddress: string | null;
  /**
   * The total number of pending [invitations](https://clerk.com/docs/reference/types/organizationinvitation) associated with this domain.
   */
  totalPendingInvitations: number;
  /**
   * The total number of pending [suggestions](https://clerk.com/docs/reference/types/organizationsuggestion) associated with this domain.
   */
  totalPendingSuggestions: number;
  /**
   * Begins the affiliation verification flow by sending a verification code to the provided email address.
   *
   * @param params - The parameters containing the affiliation email address to verify.
   * @returns A promise that resolves to the updated `OrganizationDomain` object.
   */
  prepareAffiliationVerification: (params: PrepareAffiliationVerificationParams) => Promise<OrganizationDomainResource>;

  /**
   * Completes the affiliation verification flow by validating the code sent to the affiliation email address.
   *
   * @param params - The parameters containing the verification code.
   * @returns A promise that resolves to the updated `OrganizationDomain` object.
   */
  attemptAffiliationVerification: (params: AttemptAffiliationVerificationParams) => Promise<OrganizationDomainResource>;
  /**
   * Deletes the Verified Domain.
   *
   * @returns A promise that resolves once the Verified Domain has been deleted.
   */
  delete: () => Promise<void>;
  /**
   * Updates the enrollment mode of the Verified Domain.
   *
   * @param params - The parameters containing the new enrollment mode and whether to delete pending invitations or suggestions.
   * @returns A promise that resolves to the updated `OrganizationDomain` object.
   */
  updateEnrollmentMode: (params: UpdateEnrollmentModeParams) => Promise<OrganizationDomainResource>;
}

/** @generateWithEmptyComment */
export type PrepareAffiliationVerificationParams = {
  /**
   * The email address, belonging to the domain, that the verification code is sent to.
   */
  affiliationEmailAddress: string;
};

/** @generateWithEmptyComment */
export type AttemptAffiliationVerificationParams = {
  /**
   * The verification code that was sent to the affiliation email address.
   */
  code: string;
};

/** @generateWithEmptyComment */
export type UpdateEnrollmentModeParams = Pick<OrganizationDomainResource, 'enrollmentMode'> & {
  /**
   * Whether to delete any pending [invitations](https://clerk.com/docs/reference/types/organizationinvitation) or [suggestions](https://clerk.com/docs/reference/types/organizationsuggestion) that were created by the previous enrollment mode.
   */
  deletePending?: boolean;
};
