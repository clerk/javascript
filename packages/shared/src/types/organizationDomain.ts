import type { ClerkResource } from './resource';

/**
 * The `OrganizationDomainVerification` object holds the affiliation verification details of an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains). Affiliation proves that the current user controls an email address that belongs to the domain.
 *
 * This is the object referenced by both `affiliationVerification` and the deprecated `verification` property of the `OrganizationDomainResource` object.
 */
export interface OrganizationDomainVerification {
  /**
   * The current status of the affiliation verification.
   */
  status: OrganizationDomainVerificationStatus;
  /**
   * The strategy used to verify affiliation with the domain.
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
   * <ul>
   *  <li>`txt`: Ownership is proven by publishing a DNS TXT record (see `txtRecordName` and `txtRecordValue` on `OrganizationDomainOwnershipVerification`).</li>
   *  <li>`legacy`: Ownership was implicitly granted to domains that predate the TXT verification flow, so no per-attempt proof exists.</li>
   *  <li>`manual_override`: Ownership was granted manually by a Clerk admin via the Backend API or Dashboard, bypassing the DNS challenge.</li>
   * </ul>
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
   *  <li>`manual_invitation`: No automatic enrollment. Users with a matching email domain are not given any [invitation](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-invitations) or [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions); an [admin](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) must invite them manually.</li>
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
   * Begins the verification process of a created Organization domain by sending a verification code to the provided email address.
   * @returns The updated [`OrganizationDomainResource`](https://clerk.com/docs/nextjs/reference/types/organization-domain-resource) object.
   */
  prepareAffiliationVerification: (params: PrepareAffiliationVerificationParams) => Promise<OrganizationDomainResource>;

  /**
   * Completes the verification process started by [`prepareAffiliationVerification()`](https://clerk.com/docs/nextjs/reference/types/organization-domain-resource#prepare-affiliation-verification), by validating the provided verification code.
   * @returns The updated [`OrganizationDomainResource`](https://clerk.com/docs/nextjs/reference/types/organization-domain-resource) object.
   */
  attemptAffiliationVerification: (params: AttemptAffiliationVerificationParams) => Promise<OrganizationDomainResource>;
  /**
   * Deletes the Verified Domain.
   * @returns A promise that resolves once the Verified Domain has been deleted.
   */
  delete: () => Promise<void>;
  /**
   * Updates the enrollment mode of the Verified Domain.
   * @returns The updated [`OrganizationDomainResource`](https://clerk.com/docs/nextjs/reference/types/organization-domain-resource) object.
   */
  updateEnrollmentMode: (params: UpdateEnrollmentModeParams) => Promise<OrganizationDomainResource>;
}

/** @generateWithEmptyComment */
export type PrepareAffiliationVerificationParams = {
  /** The email address, belonging to the domain, that the verification code is sent to. */
  affiliationEmailAddress: string;
};

/** @generateWithEmptyComment */
export type AttemptAffiliationVerificationParams = {
  /** The verification code that was sent to the affiliation email address. */
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
 * The `OrganizationDomainBulkOwnershipVerificationError` object is a single [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains) that could not be processed during a bulk ownership verification flow. A failed domain is reported here instead of causing the entire batch to fail.
 */
export interface OrganizationDomainBulkOwnershipVerificationError {
  /**
   * The unique identifier of the domain that could not be processed.
   */
  id: string;
  /**
   * The API error code describing why the domain was skipped, for example `resource_not_found`.
   */
  code: string;
}

/**
 * The `OrganizationDomainsBulkOwnershipVerificationResource` object is the result of a bulk ownership verification flow, such as [`prepareOwnershipVerification()`](https://clerk.com/docs/reference/types/organization-resource#prepare-ownership-verification) or [`attemptOwnershipVerification()`](https://clerk.com/docs/reference/types/organization-resource#attempt-ownership-verification), where ownership is verified for several of an Organization's [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) at once. Because the operation can partially succeed, each requested domain is reported in either `data` or `errors`.
 */
export interface OrganizationDomainsBulkOwnershipVerificationResource {
  /**
   * The domains that were processed successfully. After [`prepareOwnershipVerification()`](https://clerk.com/docs/reference/types/organization-resource#prepare-ownership-verification), each domain's `ownershipVerification` carries the `txtRecordName` and `txtRecordValue` that must be published to a DNS TXT record.
   */
  data: OrganizationDomainResource[];
  /**
   * The domains that could not be processed. Each entry identifies the domain and the reason it was skipped, while the remaining domains in the batch are still processed.
   */
  errors: OrganizationDomainBulkOwnershipVerificationError[];
}
