import type { ClerkResource } from './resource';

/**
 * Holds the affiliation verification details of an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains). Affiliation proves that the current user controls an email address that belongs to the domain, and is established by sending a one-time code to that email address.
 *
 * This is the object referenced by both `affiliationVerification` and the deprecated `verification` property of `OrganizationDomainResource`.
 */
export interface OrganizationDomainVerification {
  /**
   * The current status of the affiliation verification.
   */
  status: OrganizationDomainVerificationStatus;
  /**
   * The strategy used to verify affiliation with the domain. The only supported strategy is `'email_code'`, where a one-time code is sent to an email address on the domain.
   */
  strategy: OrganizationDomainVerificationStrategy;
  /**
   * The number of verification attempts that have been made for the current affiliation verification.
   */
  attempts: number;
  /**
   * The date and time when the current affiliation verification attempt expires.
   */
  expiresAt: Date;
}

/**
 * The strategy used to verify affiliation with an Organization's domain.
 *
 * @inline
 */
type OrganizationDomainVerificationStrategy = 'email_code';

/**
 * The current status of an Organization domain verification.
 *
 * @inline
 */
export type OrganizationDomainVerificationStatus = 'unverified' | 'verified';

/**
 * The strategy used to verify ownership of an Organization's domain.
 *
 * <ul>
 *  <li>`txt`: Ownership is proven by publishing a DNS TXT record (see `txtRecordName` and `txtRecordValue` on `OrganizationDomainOwnershipVerification`).</li>
 *  <li>`legacy`: Ownership was implicitly granted to domains that predate the TXT verification flow, so no per-attempt proof exists.</li>
 *  <li>`manual_override`: Ownership was granted manually by a Clerk admin via the Backend API or Dashboard, bypassing the DNS challenge.</li>
 * </ul>
 *
 * @inline
 */
export type OrganizationDomainOwnershipVerificationStrategy = 'txt' | 'legacy' | 'manual_override';

/**
 * Holds the ownership verification details of an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains). Ownership proves control of the underlying DNS domain, typically by publishing a TXT record, and is required before the domain can be used for enterprise SSO.
 */
export interface OrganizationDomainOwnershipVerification {
  /**
   * The current status of the domain ownership verification.
   */
  status: OrganizationDomainVerificationStatus;
  /**
   * The strategy used to verify ownership of the domain.
   */
  strategy: OrganizationDomainOwnershipVerificationStrategy;
  /**
   * The number of verification attempts that have been made for the current ownership verification, or `null` when ownership was not established through a per-attempt flow (for example, the `legacy` strategy).
   */
  attempts: number | null;
  /**
   * The date and time when the current ownership verification attempt expires, or `null` when there is no pending attempt.
   */
  expiresAt: Date | null;
  /**
   * The date and time when ownership of the domain was verified, or `null` if ownership has not been verified yet.
   */
  verifiedAt: Date | null;
  /**
   * The fully qualified DNS name under which the Organization admin must publish the TXT record. Populated while the TXT challenge is available, and `null` otherwise.
   */
  txtRecordName: string | null;
  /**
   * The exact value the Organization admin must publish in the TXT record. Populated while the TXT challenge is available, and `null` otherwise.
   */
  txtRecordValue: string | null;
}

/** @inline */
export type OrganizationEnrollmentMode =
  | 'manual_invitation'
  | 'automatic_invitation'
  | 'automatic_suggestion'
  | 'enterprise_sso';

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
   *  <li>`automatic_invitation`: Users with a matching email domain automatically receive a pending [invitation](https://clerk.com/docs/reference/types/organization-invitation) (assigned the Organization's default role) which they can accept to join.</li>
   *  <li>`automatic_suggestion`: Users with a matching email domain automatically receive a [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions) to join, which they can request.</li>
   * </ul>
   */
  enrollmentMode: OrganizationEnrollmentMode;
  /**
   * The verification details for the domain, or `null` if the domain has not been verified.
   *
   * @deprecated Use `affiliationVerification` instead.
   */
  verification: OrganizationDomainVerification | null;
  /**
   * The affiliation verification details for the domain, or `null` if the domain has not been verified.
   */
  affiliationVerification: OrganizationDomainVerification | null;
  /**
   * The ownership verification details for the domain, or `null` if ownership has not been verified.
   */
  ownershipVerification: OrganizationDomainOwnershipVerification | null;
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
   * The total number of pending [invitations](https://clerk.com/docs/reference/types/organization-invitation) associated with this domain.
   */
  totalPendingInvitations: number;
  /**
   * The total number of pending [suggestions](https://clerk.com/docs/reference/types/organization-suggestion) associated with this domain.
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
   * Whether to delete any pending [invitations](https://clerk.com/docs/reference/types/organization-invitation) or [suggestions](https://clerk.com/docs/reference/types/organization-suggestion) that were created by the previous enrollment mode.
   */
  deletePending?: boolean;
};

/** @generateWithEmptyComment */
export type CreateOrganizationDomainParams = {
  /**
   * The domain name, for example `clerk.com`.
   */
  name: string;
  /**
   * The enrollment mode that determines how matching users are added to the Organization. Defaults to `manual_invitation`.
   */
  enrollmentMode?: OrganizationEnrollmentMode;
};

/**
 * Describes a single domain that could not be processed during a bulk ownership verification flow. A failed domain is reported here instead of causing the entire batch to fail.
 */
export interface OrganizationDomainBulkOwnershipVerificationError {
  /**
   * The unique identifier of the Verified Domain that could not be processed.
   */
  id: string;
  /**
   * The API error code describing why the domain was skipped, for example `resource_not_found`.
   */
  code: string;
}

/**
 * The result of a bulk ownership verification flow, such as `prepareOwnershipVerification` or `attemptOwnershipVerification`, where ownership is verified for several of an Organization's domains at once. Because the operation can partially succeed, each requested domain is reported in either `data` or `errors`.
 */
export interface OrganizationDomainsBulkOwnershipVerificationResource {
  /**
   * The Verified Domains that were processed successfully. After `prepareOwnershipVerification`, each domain's `ownershipVerification` carries the `txtRecordName` and `txtRecordValue` that must be published to a DNS TXT record.
   */
  data: OrganizationDomainResource[];
  /**
   * The domains that could not be processed. Each entry identifies the domain and the reason it was skipped, while the remaining domains in the batch are still processed.
   */
  errors: OrganizationDomainBulkOwnershipVerificationError[];
}
